'use client';
import Image from 'next/image';
import React, {
  FC,
  experimental_useOptimistic as useOptimistic,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import 'quill/dist/quill.snow.css'; // Import Quill styles

import BannerImage from '../../../public/BannerImage.png';
import { useSocket } from '@/lib/providers/socket-provider';
import {
  updateEmojiFile,
  updateEmojiFolder,
  updateEmojiWorkspace,
  updateWorkspaceFile,
} from '@/lib/supabase/queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import EmojiPicker from '../emoji-picker';

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
  icon: string;
  fileId: string | undefined;
  dirType: 'workspace' | 'folder' | 'file';
  defaultValue: string | null;
}

const QuillEditor: FC<QuillEditorProps> = ({
  fileId = undefined,
  dirType,
  defaultValue,
  icon,
}) => {
  const [quill, setQuill] = useState<any>(null);
  const { socket } = useSocket();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [saving, setSaving] = useState(false);

  const [optimisticIcon, setOptimisticIcon] = useOptimistic(
    icon,
    (state: string, newState: string) => newState
  );

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

  const iconOnChange = async (icon: string) => {
    if (dirType === 'workspace' && fileId) {
      setOptimisticIcon(icon);
      await updateEmojiWorkspace(fileId, icon);
    } else if (dirType === 'folder' && fileId)
      await updateEmojiFolder(fileId, icon);
    else if (dirType === 'file' && fileId) await updateEmojiFile(fileId, icon);
  };

  //Send Changes for broadcasting to other clients
  useEffect(() => {
    if (quill === null || socket === null || fileId === null) return;
    const quilHandler = (delta: any, oldDelta: any, source: any) => {
      if (source !== 'user') return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaving(true);
      const contents = quill.getContents();
      const quillLength = quill.getLength();
      saveTimerRef.current = setTimeout(async () => {
        if (contents && quillLength !== 1 && fileId)
          await updateWorkspaceFile(fileId, JSON.stringify(contents));
        setSaving(false);
      }, 850);

      socket.emit('send-changes', delta, fileId);
    };
    quill.on('text-change', quilHandler);

    return () => {
      quill.off('text-change', quilHandler);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [quill, socket, fileId]);

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
    if (socket === null || quill === null || fileId === null) return;
    socket.emit('create-room', fileId);
  }, [quill, socket, fileId]);

  //Set the default Value of quill
  useEffect(() => {
    if (!defaultValue || quill === null) return;
    quill.setContents(JSON.parse(defaultValue));
  }, [defaultValue, quill]);

  return (
    <>
      <div className="relative ">
        <Image
          src={BannerImage}
          className=" w-full md:h-48 h-20 object-cover "
          alt="Folder Banner Image"
        />

        {saving ? (
          <Badge
            variant="secondary"
            className="bg-orange-600 absolute top-4 right-4 z-50"
          >
            Saving...
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-emerald-600 absolute top-4 right-4 z-50"
          >
            Saved
          </Badge>
        )}
      </div>

      <div className="flex justify-center items-center flex-col mt-2 relative ">
        <div className=" w-full self-center max-w-[800px]  md:px-10 lg:my-8">
          {icon && (
            <div className="text-[80px]">
              <EmojiPicker
                dropdownId={fileId}
                type={dirType}
                getValue={iconOnChange}
              >
                <div className="w-[100px] cursor-pointer transition-colors h-[100px] flex items-center justify-center hover:bg-muted rounded-xl">
                  {optimisticIcon}
                </div>
              </EmojiPicker>
            </div>
          )}
          <Button
            variant="ghost"
            className="top-4 bg-transparent text-muted-foreground left-4 self-start"
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
