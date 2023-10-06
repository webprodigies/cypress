'use client';
import Image from 'next/image';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import 'quill/dist/quill.snow.css'; // Import Quill styles

import BannerImage from '../../../public/BannerImage.png';
import { useSocket } from '@/lib/providers/socket-provider';
import {
  deleteFile,
  deleteFolder,
  getFileDetails,
  getFolderDetails,
  getWorkspaceDetails,
  restoreFile,
  restoreFolder,
  updateEmojiFile,
  updateEmojiFolder,
  updateEmojiWorkspace,
  updateFileFile,
  updateFolderFile,
  updateWorkspaceFile,
} from '@/lib/supabase/queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import EmojiPicker from '../emoji-picker';
import { useAppState } from '@/lib/providers/state-provider';
import { File, Folder, workspace } from '@/lib/supabase/supabase.types';
import { useRouter } from 'next/navigation';

var TOOLBAR_OPTIONS = [
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote', 'code-block'],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
  [{ direction: 'rtl' }], // text direction

  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ['clean'], // remove formatting button
];

interface QuillEditorProps {
  dirDetails: File | Folder | workspace;
  fileId: string;
  dirType: 'workspace' | 'folder' | 'file';
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  fileId,
  dirType,
  dirDetails,
}) => {
  const { state, workspaceId, folderId, dispatch } = useAppState();
  const { socket } = useSocket();
  const [quill, setQuill] = useState<any>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const details = useMemo(() => {
    let selectedDir;
    if (dirType === 'file') {
      selectedDir = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.folderId === folderId)
        ?.files.find((file) => file.id === fileId);
    }
    if (dirType === 'folder') {
      selectedDir = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.folderId === fileId);
    }
    if (dirType === 'workspace') {
      selectedDir = state.workspaces.find(
        (workspace) => workspace.id === fileId
      );
    }

    if (selectedDir) {
      return selectedDir;
    }
    return {
      title: dirDetails?.title,
      iconId: dirDetails?.iconId,
      createdAt: dirDetails?.createdAt,
      data: dirDetails?.data,
      inTrash: dirDetails?.inTrash,
    };
  }, [state]);

  //This call is needed because everything is cached and if someone made a change
  //We will only get the data from our App State
  useEffect(() => {
    let selectedDir;
    const fetchInformation = async () => {
      if (dirType === 'file') {
        selectedDir = await getFileDetails(fileId);
        if (!selectedDir[0]) {
          router.replace(`/dashboard/${workspaceId}`);
          return;
        }
        if (!workspaceId || quill === null) return;
        if (!selectedDir[0].data) return;
        quill.setContents(JSON.parse(selectedDir[0].data || ''));
        dispatch({
          type: 'UPDATE_FILE_DATA',
          payload: {
            file: selectedDir[0],
            folderId: selectedDir[0].folderId,
            workspaceId: workspaceId,
            fileId: fileId,
          },
        });
      }
      if (dirType === 'folder') {
        selectedDir = await getFolderDetails(fileId);
        if (!selectedDir[0]) {
          router.replace(`/dashboard/${workspaceId}`);
          return;
        }
        if (quill === null) return;
        if (!selectedDir[0].data) return;
        quill.setContents(JSON.parse(selectedDir[0].data || ''));
        dispatch({
          type: 'UPDATE_FOLDER_DATA',
          payload: {
            folder: selectedDir[0],
            folderId: fileId,
            workspaceId: selectedDir[0].workspaceId,
          },
        });
      }
      if (dirType === 'workspace') {
        selectedDir = await getWorkspaceDetails(fileId);
        if (!selectedDir[0] || quill === null) return;
        if (!selectedDir[0].data) return;
        quill.setContents(JSON.parse(selectedDir[0].data || ''));
        dispatch({
          type: 'UPDATE_WORKSPACE_DATA',
          payload: { workspace: selectedDir[0], workspaceId: fileId },
        });
      }
    };
    fetchInformation();
  }, [fileId, dirType, workspaceId, quill]);

  //set the state in the app state if it does not exist already
  const wrapperRef = useCallback(async (wrapper: any) => {
    if (typeof window !== 'undefined') {
      if (wrapper === null) return;
      wrapper.innerHTML = '';
      const editor = document.createElement('div');
      wrapper.append(editor);
      const Quill = (await import('quill')).default;
      const q = new Quill(editor, {
        theme: 'snow',
        modules: { toolbar: TOOLBAR_OPTIONS },
      });
      setQuill(q);
    }
  }, []);

  //When the icon changes
  const iconOnChange = async (icon: string) => {
    if (!fileId) return;
    const updateState = () => {
      dispatch({
        type: 'UPDATE_EMOJI',
        payload: { type: dirType, id: fileId, emoji: icon },
      });
    };

    if (dirType === 'workspace') {
      updateState();
      await updateEmojiWorkspace(fileId, icon);
    } else if (dirType === 'folder') {
      updateState();
      await updateEmojiFolder(fileId, icon);
    } else if (dirType === 'file') {
      updateState();
      await updateEmojiFile(fileId, icon);
    }
  };

  //Send Changes for broadcasting to other clients
  useEffect(() => {
    if (quill === null || socket === null || !fileId || !dirType) return;
    const quilHandler = (delta: any, oldDelta: any, source: any) => {
      if (source !== 'user') return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaving(true);
      const contents = quill.getContents();
      const quillLength = quill.getLength();

      saveTimerRef.current = setTimeout(async () => {
        const updateState = () => {
          dispatch({
            type: 'UPDATE_DATA',
            payload: {
              type: dirType,
              id: fileId,
              data: JSON.stringify(contents),
            },
          });
        };
        if (contents && quillLength !== 1 && fileId) {
          if (dirType === 'workspace') {
            updateState();
            await updateWorkspaceFile(fileId, JSON.stringify(contents));
          }
          if (dirType === 'folder') {
            updateState();
            await updateFolderFile(fileId, JSON.stringify(contents));
          }
          if (dirType === 'file') {
            updateState();
            await updateFileFile(fileId, JSON.stringify(contents));
          }
        }
        setSaving(false);
      }, 850);

      socket.emit('send-changes', delta, fileId);
    };
    quill.on('text-change', quilHandler);

    return () => {
      quill.off('text-change', quilHandler);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [quill, socket, fileId, , details]);

  const restoreFileHandler = async () => {
    if (dirType === 'file') {
      if (!folderId) return;
      dispatch({
        type: 'RESTORE_FILE',
        payload: { fileId, folderId: folderId },
      });
      await restoreFile(fileId);
    }
    if (dirType === 'folder') {
      if (!fileId) return;
      dispatch({
        type: 'RESTORE_FOLDER',
        payload: fileId,
      });
      await restoreFolder(fileId);
    }
  };

  const permanantlyDelete = async () => {
    if (dirType === 'file') {
      if (!folderId || !workspaceId) return;
      dispatch({
        type: 'DELETE_FILE',
        payload: { fileId, folderId: folderId, workspaceId },
      });
      await deleteFile(fileId);
      router.replace(`/dashboard/${workspaceId}`);
    }
    if (dirType === 'folder') {
      if (!workspaceId || !folderId) return;
      dispatch({
        type: 'DELETE_FOLDER',
        payload: { workspaceId, folderId },
      });
      await deleteFolder(fileId);
      router.replace(`/dashboard/${workspaceId}`);
    }
  };

  //Receiving the changes
  useEffect(() => {
    if (quill === null || socket === null) return;
    const socketHandler = (deltas: any, id: string) => {
      if (id === fileId) {
        quill.updateContents(deltas);
      }
    };
    socket.on('receive-changes', socketHandler);

    return () => {
      socket.off('receive-changes', socketHandler);
    };
  }, [quill, socket, fileId]);

  //Creating socket rooms
  useEffect(() => {
    if (socket === null || quill === null || !fileId) return;
    socket.emit('create-room', fileId);
  }, [quill, socket, fileId]);

  return (
    <>
      <div className="relative ">
        {details.inTrash && (
          <article className="py-2 z-40 bg-[#EB5757] flex  md:flex-row flex-col justify-center items-center gap-4 flex-wrap">
            <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
              <span className="text-white">
                This {dirType} is in the trash.
              </span>
              <Button
                size={'sm'}
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-[#EB5757]"
                onClick={restoreFileHandler}
              >
                Restore
              </Button>
              <Button
                variant="outline"
                size={'sm'}
                className="bg-transparent border-white text-white hover:bg-white hover:text-[#EB5757]"
                onClick={permanantlyDelete}
              >
                Permanantly Delete
              </Button>
            </div>
            <span className="text-sm text-white">{details.inTrash}</span>
          </article>
        )}
        <Image
          src={BannerImage}
          className=" w-full md:h-48 h-20 object-cover "
          alt="Folder Banner Image"
        />

        {saving ? (
          <Badge
            variant="secondary"
            className="bg-orange-600 absolute top-4 text-white right-4 z-50"
          >
            Saving...
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-emerald-600 absolute top-4 text-white right-4 z-50"
          >
            Saved
          </Badge>
        )}
      </div>

      <div className="flex justify-center items-center flex-col mt-2 relative ">
        <div className=" w-full self-center max-w-[800px] flex flex-col px-7 lg:my-8">
          <div className="text-[80px]">
            <EmojiPicker
              dropdownId={fileId}
              type={dirType}
              getValue={iconOnChange}
            >
              <div className="w-[100px] cursor-pointer transition-colors h-[100px] flex items-center justify-center hover:bg-muted rounded-xl">
                {details.iconId}
              </div>
            </EmojiPicker>
          </div>

          <span className="text-muted-foreground text-3xl font-bold h-9">
            {details?.title}
          </span>
          <span className="text-muted-foreground text-sm ">
            {dirType.toUpperCase()}
          </span>
          <Button
            size={'sm'}
            variant="secondary"
            className="top-4 bg-transparent mt-4 z-50 text-muted-foreground left-4 self-start"
          >
            Add Banner
          </Button>
        </div>
        <div
          id="container"
          className="max-w-[800px]"
          ref={wrapperRef}
        ></div>
      </div>
    </>
  );
};

export default QuillEditor;
