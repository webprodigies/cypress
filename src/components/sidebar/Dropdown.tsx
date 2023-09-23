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
import WorkspaceEditor from '../workspaceEditor';
import IconSelector from '../iconSelector';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getFiles } from '@/lib/supabase/queries';
import { File } from '@/lib/supabase/supabase.types';
import CypressHomeIcon from '../icons/cypressHomeIcon';

interface DropdownProps {
  title: string;
  id: string;
  listType: 'folder' | 'file' | 'native';
  iconId?: (typeof ICON_NAMES)[number];
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
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchFolders = async () => {
      if (listType === 'folder') {
        console.log(listType);
        const response = await getFiles(id);
        setFiles(response);
      }
    };
    fetchFolders();
  }, []);

  const Icon = ICON_NAME_MAPPING[iconId || 'folder'];
  const createNew = listType === 'folder' ? 'folder' : 'file';
  const isFolder = listType === 'folder';
  const groupIdentifies = clsx(
    'dark:text-white whitespace-nowrap flex justify-between items-center w-full relative',
    { 'group/folder': isFolder, 'group/file': !isFolder }
  );
  const description =
    listType === 'folder'
      ? 'Folders allow you group related topics together.'
      : 'File are a powerful way to express your thoughts.';

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

  const navigatePage = (accordianId: string, type: string) => {
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
            <CustomDialogTrigger content={<IconSelector />}>
              {listType === 'native' ? (
                <div className="w-[14px] h-[16px] flex items-center ">
                  {customIcon}
                </div>
              ) : (
                <div className="w-[14px] h-[16px] ">
                  <Icon
                    name={iconId}
                    size={18}
                  />
                </div>
              )}
            </CustomDialogTrigger>
            <span className="overflow-ellipsis text-Neutrals-7 overflow-hidden w-[140px] cursor-pointer">
              {title}
            </span>
          </div>

          {listType === 'folder' && (
            <div className={commandStyles}>
              <TooltipComponent message="Edit">
                <MoreHorizontalIcon
                  size={15}
                  className="hover:dark:text-white dark:text-Neutrals-7 transition-colors"
                />
              </TooltipComponent>

              <TooltipComponent message="Add Folder">
                <CustomDialogTrigger
                  header={`Create a new ${createNew}`}
                  description={description}
                  content={<WorkspaceEditor type={createNew} />}
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
                  header={`Create a new ${createNew}`}
                  description={description}
                  content={<WorkspaceEditor type={createNew} />}
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
        {files.map((file, index) => {
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
