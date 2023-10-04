'use client';
import { ICON_NAMES, ICON_NAME_MAPPING } from '@/lib/constants';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import CustomDialogTrigger from '../customDialogTrigger';
import TooltipComponent from '../tooltip';
import { MoreHorizontalIcon, PlusIcon } from 'lucide-react';
import fileCreator from '../fileCreator';
import IconSelector from '../iconSelector';
import { usePathname, useRouter } from 'next/navigation';
import { ChangeEventHandler, useEffect, useState } from 'react';
import { getFiles } from '@/lib/supabase/queries';
import { File } from '@/lib/supabase/supabase.types';
import EmojiPicker from '../emoji-picker';
import FileCreator from '../fileCreator';
import FileEditor from '../file-Editor';
import { useFolders } from '@/lib/providers/file-provider';

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
  const [isEditing, setIsEditing] = useState(false);
  const [folderTitle, setFolderTitle] = useState(title);
  const [fileTitle, setFileTitle] = useState(title);
  const router = useRouter();
  const pathname = usePathname();

  const navigatePage = (accordianId: string, type: string) => {
    if (!pathname) return;
    const [workspaceId, folderId, fileId] = pathname
      .split('/dashboard/')[1]
      .split('/');

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

  const addNewFile = (newFile: {
    id: string;
    title: string;
    iconId: string;
  }) => {
    setFolders((currentFolder) => {
      return currentFolder.map((folder) => {
        if (folder.folderId === id) {
          return {
            folderId: id,
            files: [
              ...folder.files,
              {
                folderId: id,
                data: null,
                createdAt: '',
                ...newFile,
              },
            ],
          };
        }
        return folder;
      });
    });
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (!fileTitle) setFileTitle(title);
    setIsEditing(false);
  };

  const fileTitleChange = (e: any) => {
    setFileTitle(e.target.value);
    const fileAndFolderId = id.split('folder');
    if (fileAndFolderId.length === 2 && fileAndFolderId[1]) {
      setFolders((currentFolder) =>
        currentFolder.map((folder) => {
          if (folder.folderId === fileAndFolderId[0]) {
            const updatedFiles = folder.files.map((file) => {
              if (file.id === fileAndFolderId[1]) {
                return {
                  ...file,
                  title: fileTitle,
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
    }
  };

  const folderTitleChange = (e: any) => {
    if (id.split('folder').length === 1) {
      setFolderTitle(e.target.value);
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
      'h-full pl-3 dark:bg-Neutrals-12 hidden rounded-sm absolute right-0 items-center gap-2 bg-washed-purple-100 justify-center',
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

          {listType === 'folder' && (
            <div className={commandStyles}>
              <TooltipComponent message="Edit Folder">
                <CustomDialogTrigger
                  header="Edit Folder details"
                  description="Change the folder name or icon to confirm edits."
                  content={
                    <FileEditor
                      parentId={id}
                      defaultIcon={iconId}
                      defaultTitle={title}
                      type={listType}
                    />
                  }
                >
                  <MoreHorizontalIcon
                    size={15}
                    className="hover:dark:text-white dark:text-Neutrals-7 transition-colors"
                  />
                </CustomDialogTrigger>
              </TooltipComponent>

              <TooltipComponent message="Add File">
                <CustomDialogTrigger
                  header="Create a new file"
                  description="Files are a powerful way to express your thoughts."
                  content={
                    <FileCreator
                      getNewValue={addNewFile}
                      parent={id}
                      type="file"
                    />
                  }
                >
                  <PlusIcon
                    size={15}
                    className="hover:dark:text-white dark:text-Neutrals-7 transition-colors"
                  />
                </CustomDialogTrigger>
              </TooltipComponent>
            </div>
          )}
          {listType === 'file' && (
            <div className="h-full hidden group-hover/file:block rounded-sm absolute right-0 items-center gap-2  justify-center">
              <TooltipComponent message="Edit">
                <CustomDialogTrigger
                  header="Edit file"
                  description="Change the file name or icon to confirm edits."
                  content={
                    <FileEditor
                      parentId={id}
                      type="file"
                      defaultIcon={iconId}
                      defaultTitle={title}
                    />
                  }
                >
                  <MoreHorizontalIcon
                    size={15}
                    className="hover:dark:text-white dark:text-Neutrals-7 transition-colors"
                  />
                </CustomDialogTrigger>
              </TooltipComponent>
            </div>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="">
        {folders
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
