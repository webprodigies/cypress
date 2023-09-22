'use client';
import { ICON_NAMES, ICON_NAME_MAPPING } from '@/lib/constants';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import clsx from 'clsx';
import {
  usePathname,
  useRouter,
  useSelectedLayoutSegments,
} from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import CustomDialogTrigger from './customDialogTrigger';
import TooltipComponent from './tooltip';
import { MoreHorizontalIcon, PlusIcon } from 'lucide-react';
import WorkspaceEditor from './workspaceEditor';
import IconSelector from './iconSelector';
import { Accordion } from '@radix-ui/react-accordion';
import Link from 'next/link';

interface DropdownProps {
  title: string;
  id: string;
  listType: 'folder' | 'file';
  iconId: (typeof ICON_NAMES)[number];
  children?: React.ReactNode;
  onClick: (id: string, listType: 'folder' | 'file') => void;
  test?: any;
  defaultValue?: string[];
  disabled?: boolean;
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

  ...props
}: DropdownProps) {
  const segments = useSelectedLayoutSegments();

  const Icon = ICON_NAME_MAPPING[iconId];
  const createNew = listType === 'folder' ? 'folder' : 'file';
  const isFolder = listType === 'folder';
  const groupIdentifies = clsx(
    'dark:text-white whitespace-nowrap flex justify-between items-center relative',
    { 'group/workspace': isFolder, 'group/folder': !isFolder }
  );
  const description =
    listType === 'folder'
      ? 'Folders allow you group related topics together.'
      : 'File are a powerfull way to express your thoughts.';

  const listStyles = clsx('relative ', {
    'border-none ': isFolder,
    'border-none ml-2': !isFolder,
  });

  const commandStyles = twMerge(
    clsx(
      'h-full pl-3 dark:bg-Neutrals-12 hidden rounded-sm absolute right-0 items-center gap-2 bg-washed-purple-100 justify-center',
      {
        'group-hover/workspace:flex': isFolder,
        'group-hover/folder:flex': !isFolder,
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
        onClick(id, listType);
      }}
    >
      <AccordionTrigger
        id={listType}
        className="hover:no-underline p-2 dark:text-muted-foreground text-sm"
      >
        <div className={groupIdentifies}>
          <div className="flex gap-2 items-center justify-center overflow-hidden ">
            <CustomDialogTrigger content={<IconSelector />}>
              <div className="w-[14px] h-[16px]">
                <Icon
                  name={iconId}
                  size={16}
                />
              </div>
            </CustomDialogTrigger>

            <span className="overflow-ellipsis overflow-hidden w-[140px]">
              {title}
            </span>
          </div>

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
        </div>
      </AccordionTrigger>

      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
}
