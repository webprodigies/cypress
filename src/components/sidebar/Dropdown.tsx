'use client';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import TooltipComponent from '../tooltip';
import { PlusIcon, Trash } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';

import EmojiPicker from '../emoji-picker';
import dynamic from 'next/dynamic';
import {
  createFile,
  sendFileToTrash,
  sendFolderToTrash,
  updateEmojiFile,
  updateEmojiFolder,
  updateFile,
  updateFolder,
  updateTitleFile,
  updateTitleFolder,
} from '@/lib/supabase/queries';
import { useAppState } from '@/lib/providers/state-provider';
import { File } from '@/lib/supabase/supabase.types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface DropdownProps {
  title: string;
  id: string;
  listType: 'folder' | 'file' | 'native';
  iconId: string;
  children?: React.ReactNode;
  disabled?: boolean;
  customIcon?: React.ReactNode;
}

export function Dropdown({
  title,
  id,
  listType,
  iconId,
  children,
  disabled,
  customIcon,
  ...props
}: DropdownProps) {
  const supabase = createClientComponentClient();
  const { state, dispatch, workspaceId } = useAppState();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const folderTitle: string | undefined = useMemo(() => {
    if (listType === 'folder') {
      const stateTitle = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.folderId === id)?.title;
      if (title === stateTitle || !stateTitle) return title;
      return stateTitle;
    }
  }, [state, listType]);

  //Memoized file title so that when the value changes we can use this
  const fileTitle: string | undefined = useMemo(() => {
    if (listType === 'file') {
      const fileAndFolderId = id.split('folder');
      const stateTitle = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.folderId === fileAndFolderId[0])
        ?.files.find((file) => file.id === fileAndFolderId[1])?.title;
      if (title === stateTitle || !stateTitle) return title;
      return stateTitle;
    }
  }, [state, listType]);

  //WIP
  const navigatePage = (accordianId: string, type: string) => {
    if (!pathname) return;
    const [workspaceId] = pathname.split('/dashboard/')[1].split('/');

    if (type === 'folder') {
      router.push(`/dashboard/${workspaceId}/${accordianId}`);
    }
    if (type === 'file') {
      const fileFolderRelation = accordianId.split('folder');
      router.push(
        `/dashboard/${workspaceId}/${fileFolderRelation[0]}/${fileFolderRelation[1]}`
      );
    }
  };

  const addNewFile = async () => {
    if (!workspaceId) return;
    const newFile: File = {
      folderId: id,
      data: null,
      createdAt: new Date().toISOString(),
      inTrash: null,
      title: 'Untitled',
      iconId: '📄',
      id: uuid(),
      workspaceId,
    };

    dispatch({
      type: 'ADD_FILE',
      payload: { file: newFile, folderId: id, workspaceId },
    });
    await createFile(newFile);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = async () => {
    //If it is a folder
    setIsEditing(false);
    const folderId = id.split('folder');
    if (folderId.length === 1) {
      if (!folderTitle) return;
      await updateTitleFolder(folderId[0], folderTitle);
    }
    //If it is a file
    if (folderId.length === 2 && folderId[1]) {
      if (!fileTitle) return;
      await updateTitleFile(folderId[1], fileTitle);
    }
  };

  const fileTitleChange = (e: any) => {
    const fileAndFolderId = id.split('folder');
    if (fileAndFolderId.length === 2 && fileAndFolderId[1]) {
      dispatch({
        type: 'UPDATE_TITLE',
        payload: {
          type: 'file',
          title: e.target.value,
          id: fileAndFolderId[1],
        },
      });
    }
  };

  const folderTitleChange = (e: any) => {
    const folderId = id.split('folder');
    if (folderId.length === 1) {
      dispatch({
        type: 'UPDATE_TITLE',
        payload: { type: 'folder', title: e.target.value, id: folderId[0] },
      });
    }
  };

  const changeEmoji = async (selectedEmoji: string) => {
    const pathId = id.split('folder');
    //folder
    if (listType === 'folder' && pathId.length === 1) {
      dispatch({
        type: 'UPDATE_EMOJI',
        payload: { type: 'folder', id: pathId[0], emoji: selectedEmoji },
      });
      await updateEmojiFolder(pathId[0], selectedEmoji);
    }
    //file
    if (listType === 'file' && pathId.length === 2) {
      dispatch({
        type: 'UPDATE_EMOJI',
        payload: { type: 'file', id: pathId[1], emoji: selectedEmoji },
      });
      await updateEmojiFile(pathId[1], selectedEmoji);
    }
  };

  //WIP
  const moveToTrash = async () => {
    const user = await supabase.auth.getUser();
    const pathId = id.split('folder');
    if (listType === 'folder') {
      dispatch({
        type: 'TRASH_FOLDER',
        payload: {
          id: pathId[0],
          message: `Deleted by ${user.data.user?.email}`,
        },
      });
      await sendFolderToTrash(pathId[0], `Deleted by ${user.data.user?.email}`);
    }
    if (listType === 'file') {
      dispatch({
        type: 'TRASH_FILE',
        payload: {
          fileId: pathId[1],
          message: `Deleted by ${user.data.user?.email}`,
        },
      });
      await sendFileToTrash(pathId[1], `Deleted by ${user.data.user?.email}`);
    }
  };

  const isFolder = listType === 'folder';
  const groupIdentifies = clsx(
    'dark:text-white whitespace-nowrap flex justify-between items-center w-full relative',
    { 'group/folder': isFolder, 'group/file': !isFolder }
  );

  const listStyles = clsx('relative ', {
    'border-none text-md': isFolder,
    'border-none ml-6 text-[16px] py-1': !isFolder,
  });

  const commandStyles = twMerge(
    clsx(
      'h-full pl-3 bg-background hidden rounded-sm absolute right-0 items-center gap-2 justify-center',
      {
        'group-hover/folder:flex': isFolder,
        'group-hover/file:hidden': !isFolder,
      }
    )
  );

  return (
    <AccordionItem
      value={id}
      className={listStyles}
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        navigatePage(id, listType);
      }}
    >
      <AccordionTrigger
        id={listType}
        className="hover:no-underline p-2 dark:text-muted-foreground text-sm "
        disabled={listType === 'file'}
      >
        <div className={groupIdentifies}>
          <div className="flex gap-4 items-center justify-center overflow-hidden ">
            {listType === 'native' ? (
              <div className="w-[14px]  flex items-center ">{customIcon}</div>
            ) : (
              <div className="relative">
                <EmojiPicker
                  getValue={changeEmoji}
                >
                  {iconId}
                </EmojiPicker>
              </div>
            )}

            <input
              type="text"
              value={listType === 'folder' ? folderTitle : fileTitle}
              className={`outline-none overflow-hidden w-[140px] text-Neutrals-7 ${
                isEditing
                  ? 'bg-muted cursor-text'
                  : 'bg-transparent cursor-pointer '
              }`}
              readOnly={!isEditing}
              onDoubleClick={handleDoubleClick}
              onBlur={handleBlur}
              onChange={
                listType === 'folder' ? folderTitleChange : fileTitleChange
              }
            />
          </div>

          {listType === 'folder' && !isEditing && (
            <div className={commandStyles}>
              <TooltipComponent message="Delete Folder">
                <Trash
                  onClick={moveToTrash}
                  size={15}
                  className="hover:dark:text-white dark:text-Neutrals-7 transition-colors"
                />
              </TooltipComponent>

              <TooltipComponent message="Add File">
                <PlusIcon
                  onClick={addNewFile}
                  size={15}
                  className="hover:dark:text-white dark:text-Neutrals-7 transition-colors"
                />
              </TooltipComponent>
            </div>
          )}
          {listType === 'file' && !isEditing && (
            <div className="h-full hidden group-hover/file:block rounded-sm absolute right-0 items-center gap-2  justify-center">
              <TooltipComponent message="Delete File">
                <Trash
                  onClick={moveToTrash}
                  size={15}
                  className="hover:dark:text-white dark:text-Neutrals-7 transition-colors"
                />
              </TooltipComponent>
            </div>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent>
        {state.workspaces
          .find((workspace) => workspace.id === workspaceId)
          ?.folders.find((folder) => folder.folderId === id)
          ?.files.filter((file) => !file.inTrash)
          .map((file) => {
            const customfileId = `${id}folder${file.id}`;
            return (
              <Dropdown
                key={file.id}
                title={file.title}
                listType="file"
                id={customfileId}
                iconId={file.iconId}
              />
            );
          })}
      </AccordionContent>
    </AccordionItem>
  );
}
