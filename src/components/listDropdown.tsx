'use client';
import React, { MouseEventHandler } from 'react';
import clsx from 'clsx';

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import Link from 'next/link';
import { MoreHorizontalIcon, PlusIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Icon from './icon';
import { ICON_NAMES } from '@/lib/constants';
import TooltipComponent from './tooltip';
import CustomDialogTrigger from './customDialogTrigger';
import IconSelector from './iconSelector';
import WorkspaceEditor from './workspaceEditor';
import { getWorkspaceFolders } from '@/lib/supabase/queries';
import { useRouter } from 'next/navigation';

interface ListDropdownProps {
  title: string;
  id: string;
  listType: 'workspace' | 'folder';
  iconId: (typeof ICON_NAMES)[number];
  children?: React.ReactNode;
  onClick?: MouseEventHandler;
  createNew?: 'workspace' | 'folder' | 'file';
}

export function ListDropdown({
  title,
  id,
  listType,
  iconId,
  children,
  onClick,
  createNew,
  ...props
}: ListDropdownProps) {
  //Use search params is cousing a rerender to get the url route.
  //searchParams
  const router = useRouter();
  const isWorkspace = listType === 'workspace';
  const groupIdentifies = clsx(
    'dark:text-white whitespace-nowrap flex justify-between items-center relative',
    { 'group/workspace': isWorkspace, 'group/folder': !isWorkspace }
  );
  const description =
    createNew === 'folder'
      ? 'Folders allow you group related topics together.'
      : 'File are a powerfull way to express your thoughts.';

  const listTyles = clsx('relative', {
    'border-none px-2 rounded-xl': isWorkspace,
    'border-none rounded-md ml-2': !isWorkspace,
  });

  const commandStyles = twMerge(
    clsx(
      'h-full pl-3 dark:bg-Neutrals-12 hidden rounded-sm absolute right-0 items-center gap-2 bg-washed-purple-100 justify-center',
      {
        'group-hover/workspace:flex': isWorkspace,
        'group-hover/folder:flex': !isWorkspace,
      }
    )
  );

  const accordianClick = async (
    event: React.MouseEvent<HTMLElement>,
    id: string
  ) => {
    console.log(listType);
    if (listType === 'workspace') {
      // const response = await getWorkspaceFolders(id);
      router.push(`/dashboard/${id}?key="value"`);
    }
    if (listType === 'folder') {
    }
  };

  const fakeData: string[] = ['string', 'Element', 'chiclen'];
  return (
    <AccordionItem
      value={id}
      className={listTyles}
      {...props}
    >
      <Link
        key={id}
        href={`/dashboard/${id}`}
      >
        <AccordionTrigger
          onClick={(e) => accordianClick(e, id)}
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
      </Link>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
}
