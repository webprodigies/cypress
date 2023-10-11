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
  findProfile,
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
import {
  File,
  Folder,
  Profile,
  workspace,
} from '@/lib/supabase/supabase.types';
import {
  usePathname,
  useRouter,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
} from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AuthUser } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

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
  const [cursor, setCursor] = useState<any>(null);
  const [user, setUser] = useState<Profile>();
  const [collaborators, setCollaborators] = useState<
    { id: string; email: string; avatarUrl: string }[]
  >([]);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const pathname = usePathname();

  const breadCrumbs = useMemo(() => {
    if (!pathname || !state.workspaces || !workspaceId) return '';

    const segments = pathname
      .split('/')
      .filter((val) => val !== 'dashboard' && val);

    const workspaceDetails = state.workspaces.find(
      (workspace) => workspace.id === workspaceId
    );
    const workspaceBreadCrumb = workspaceDetails
      ? `${workspaceDetails.iconId} ${workspaceDetails.title}`
      : '';

    if (segments.length === 1) {
      return workspaceBreadCrumb;
    }

    const folderSegment = segments[1];
    const folderDetails = workspaceDetails?.folders.find(
      (folder) => folder.folderId === folderSegment
    );
    const folderBreadCrumb = folderDetails
      ? `/ ${folderDetails.iconId} ${folderDetails.title}`
      : '';

    if (segments.length === 2) {
      return `${workspaceBreadCrumb} ${folderBreadCrumb}`;
    }

    const fileSegment = segments[2];
    const fileDetails = folderDetails?.files.find(
      (file) => file.id === fileSegment
    );
    const fileBreadCrumb = fileDetails
      ? `/ ${fileDetails.iconId} ${fileDetails.title}`
      : '';

    return `${workspaceBreadCrumb} ${folderBreadCrumb} ${fileBreadCrumb}`;
  }, [state, pathname, workspaceId]);

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

  //Creating the quill editor
  const wrapperRef = useCallback(async (wrapper: any) => {
    if (typeof window !== 'undefined') {
      if (wrapper === null) return;
      wrapper.innerHTML = '';
      const editor = document.createElement('div');
      wrapper.append(editor);
      const Quill = (await import('quill')).default;
      const QuillCursors = (await import('quill-cursors')).default;
      Quill.register('modules/cursors', QuillCursors);

      const q = new Quill(editor, {
        theme: 'snow',
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          cursors: {
            transformOnTextChange: true,
          },
        },
      });
      //WIP Cursors
      // const cursorsOne = q.getModule('cursors');
      // cursorsOne.createCursor('cursor', 'User 2', 'blue');
      // setCursor(cursorsOne);
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

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: userData },
      } = await supabase.auth.getUser();
      if (userData) {
        const response = await findProfile(userData.id);
        if (response)
          setUser({
            ...response,
            avatarUrl: response.avatarUrl
              ? supabase.storage
                  .from('avatars')
                  .getPublicUrl(response.avatarUrl).data.publicUrl
              : '',
          });
      }
    };
    getUser();
  }, [supabase]);

  //Real time user infomation
  useEffect(() => {
    if (!fileId) return;
    const room = supabase.channel(fileId);
    const subscription = room
      .on('presence', { event: 'sync' }, () => {
        const newState = room.presenceState();
        const newCollaborators = Object.values(newState).flat() as any;

        setCollaborators(newCollaborators);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED' || !user) {
          return;
        }

        room.track({
          id: user?.id,
          email: user?.email?.split('@')[0],
          avatarUrl: user.avatarUrl,
        });
      });
    return () => {
      supabase.removeChannel(room);
    };
  }, [fileId, user]);

  //Send Changes for broadcasting to other clients
  useEffect(() => {
    if (quill === null || socket === null || !fileId || !dirType) return;
    // const selectionChangeHandler = (cursor: any) => {
    //   return (range: any, oldRange: any, source: any) => {
    //     if (source === 'user') {
    //       cursor.moveCursor('cursor', range);
    //     } else cursor.moveCursor('cursor', range);
    //   };
    // };
    const quillHandler = (delta: any, oldDelta: any, source: any) => {
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
    quill.on('text-change', quillHandler);
    // quill.on('selection-change', selectionChangeHandler(cursor));

    return () => {
      quill.off('text-change', quillHandler);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [quill, socket, fileId, details, cursor]);

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
        payload: { folderId },
      });
      await deleteFolder(folderId);
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
      <div className="relative">
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
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between justify-center sm:items-center sm:p-2 p-8">
          <div className="">{breadCrumbs}</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-10 ">
              {collaborators.map((collaborator, index) => (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="-ml-3 bg-background border-2 flex items-center justify-center border-white h-8 w-8 rounded-full">
                        <AvatarImage
                          src={
                            collaborator.avatarUrl ? collaborator.avatarUrl : ''
                          }
                          className="rounded-full"
                        />
                        <AvatarFallback className="">
                          {collaborator?.email?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>{collaborator.email}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            {saving ? (
              <Badge
                variant="secondary"
                className="bg-orange-600 top-4 text-white right-4 z-50"
              >
                Saving...
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-emerald-600 top-4 text-white right-4 z-50"
              >
                Saved
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="relative">
        <Image
          src={BannerImage}
          className=" w-full md:h-48 h-20 object-cover"
          alt="Banner Image"
        />
      </div>

      <div className="flex justify-center items-center flex-col mt-2 relative ">
        <div className=" w-full self-center max-w-[800px] flex flex-col px-7 lg:my-8">
          <div className="text-[80px]">
            <EmojiPicker getValue={iconOnChange}>
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
