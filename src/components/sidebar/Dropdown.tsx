'use client';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import CustomDialogTrigger from '../customDialogTrigger';
import TooltipComponent from '../tooltip';
import { Delete, MoreHorizontalIcon, PlusIcon, Trash } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';

import EmojiPicker from '../emoji-picker';
import { useFiles } from '@/lib/providers/file-provider';
import dynamic from 'next/dynamic';
import { useFolders } from '@/lib/providers/folder-provider';
import {
  createFile,
  updateEmojiFile,
  updateEmojiFolder,
  updateTitleFile,
  updateTitleFolder,
} from '@/lib/supabase/queries';

interface DropdownProps {
  title: string;
  id: string;
  listType: 'folder' | 'file' | 'native';
  iconId: string;
  children?: React.ReactNode;
  onClick?: (id: string, listType: 'folder' | 'file') => void;
  test?: any;
  defaultValue?: string[];
  disabled?: boolean;
  customIcon?: React.ReactNode;
}

export function Dropdown({
  title,
  id,
  listType,
  iconId,
  children,
  onClick,
  test,
  disabled,
  defaultValue,
  customIcon,
  ...props
}: DropdownProps) {
  const { folders, setFolders } = useFolders();
  const CustomAlert = dynamic(() => import('../custom-alert'), { ssr: false });
  const { files, setFiles } = useFiles();
  const [isEditing, setIsEditing] = useState(false);
  const [folderTitle, setFolderTitle] = useState(title);
  const [fileTitle, setFileTitle] = useState(title);
  const router = useRouter();
  const pathname = usePathname();

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
    const newFile = {
      folderId: id,
      data: null,
      createdAt: new Date().toISOString(),
      inTrash: null,
      title: 'Untitled',
      iconId: '📄',
      id: uuid(),
    };

    setFiles((currentFolder) => {
      return currentFolder.map((folder) => {
        if (folder.folderId === id) {
          return {
            folderId: id,
            files: [...folder.files, newFile],
          };
        }
        return folder;
      });
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
      if (!folderTitle) {
        setFolderTitle(title);
        return;
      }
      await updateTitleFolder(folderId[0], folderTitle);
    }
    //If it is a file
    if (folderId.length === 2 && folderId[1]) {
      if (!fileTitle) {
        setFileTitle(title);
        return;
      }
      await updateTitleFile(folderId[1], fileTitle);
    }
  };

  const fileTitleChange = (e: any) => {
    const fileAndFolderId = id.split('folder');
    if (fileAndFolderId.length === 2 && fileAndFolderId[1]) {
      setFiles((currentFolders) =>
        currentFolders.map((folder) => {
          if (folder.folderId === fileAndFolderId[0]) {
            const updatedFiles = folder.files.map((file) => {
              if (file.id === fileAndFolderId[1]) {
                return {
                  ...file,
                  title: e.target.value,
                };
              }
              return file;
            });

            return {
              ...folder,
              files: updatedFiles,
            };
          }
          return folder;
        })
      );
      setFileTitle(e.target.value);
    }
  };

  const folderTitleChange = (e: any) => {
    const folderId = id.split('folder');
    if (folderId.length === 1) {
      setFolders(
        folders.map((folder) => {
          if (folder.folderId === folderId[0]) {
            return {
              ...folder,
              title: e.target.value,
            };
          }
          return folder;
        })
      );
      setFolderTitle(e.target.value);
    }
  };

  const changeEmoji = async (selectedEmoji: string) => {
    const pathId = id.split('folder');
    //folder
    if (listType === 'folder' && pathId.length === 1) {
      await updateEmojiFolder(pathId[0], selectedEmoji);
      router.refresh();
    }
    //file
    if (listType === 'file' && pathId.length === 2) {
      setFiles((currentFolders) =>
        currentFolders.map((folder) => {
          if (folder.folderId === pathId[0]) {
            const updatedFiles = folder.files.map((file) => {
              if (file.id === pathId[1]) {
                return {
                  ...file,
                  iconId: selectedEmoji,
                };
              }
              return file;
            });

            return {
              ...folder,
              files: updatedFiles,
            };
          }
          return folder;
        })
      );
      await updateEmojiFile(pathId[1], selectedEmoji);
    }
  };

  //WIP
  const deleteFolderHandler = () => {};

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
                  dropdownId={id}
                  type={listType}
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
                <CustomAlert
                  continueHandler={deleteFolderHandler}
                  title="Are your sure?"
                  description="This will send all data related to this folder including files to the trash. You can restore it from there if needed."
                  continueTitle="Delete"
                  cancelTitle="Cancel"
                >
                  <Trash
                    size={15}
                    className="hover:dark:text-white dark:text-Neutrals-7 transition-colors"
                  />
                </CustomAlert>
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
                <CustomAlert
                  continueHandler={deleteFolderHandler}
                  title="Are your sure?"
                  description="This will send all data related to this file to the trash. You can restore it from there if needed."
                  continueTitle="Delete"
                  cancelTitle="Cancel"
                >
                  <Trash
                    size={15}
                    className="hover:dark:text-white dark:text-Neutrals-7 transition-colors"
                  />
                </CustomAlert>
              </TooltipComponent>
            </div>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="">
        {files
          .find((folder) => folder.folderId === id)
          ?.files.map((file, index) => {
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
