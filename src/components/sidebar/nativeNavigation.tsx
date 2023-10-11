'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { FC } from 'react';
import CypressHomeIcon from '../icons/cypressHomeIcon';
import CypressMessageIcon from '../icons/cypressMessageIcon';
import CypressSettingsIcon from '../icons/cypressSettingsIcon';
import CypressTemplateIcon from '../icons/cypressTemplatesIcon';
import CypressTrashIcon from '../icons/cypressTrashIcon';
import { twMerge } from 'tailwind-merge';
import Settings from '../settings/settings';

export const nativeNavigations = [
  {
    title: 'My Workspace',
    id: 'dashboard',
    customIcon: CypressHomeIcon,
  },
  {
    title: 'Messages',
    id: 'messages',
    customIcon: CypressMessageIcon,
  },
  {
    title: 'Settings',
    id: 'settings',
    customIcon: CypressSettingsIcon,
  },
  {
    title: 'Templates',
    id: 'templates',
    customIcon: CypressTemplateIcon,
  },
  {
    title: 'Trash',
    id: 'trash',
    customIcon: CypressTrashIcon,
  },
] as const;

interface NativeNavigationProps {
  myWorkspaceId: string;
  className?: string;
  getSelectedElement?: (selection: string) => void;
}
const NativeNavigation: FC<NativeNavigationProps> = ({
  myWorkspaceId,
  className,
  getSelectedElement,
}) => {
  const router = useRouter();
  return (
    <nav className={twMerge('my-2', className)}>
      <ul>
        {nativeNavigations.map((menu) => {
          const link =
            menu.id === 'dashboard' ? `/dashboard/${myWorkspaceId}` : '';
          if (menu.id === 'settings') {
            return (
              <Settings>
                <li
                  key={menu.id}
                  onClick={async () => {
                    if (link) {
                      router.push(link);
                    }
                  }}
                  className="group/native flex text-Neutrals-7 transition-all hover:dark:text-white cursor-pointer py-1 gap-2"
                >
                  <menu.customIcon></menu.customIcon>
                  <span>{menu.title}</span>
                </li>
              </Settings>
            );
          }
          return (
            // WIP Add links for others too
            <li
              key={menu.id}
              onClick={async () => {
                if (link) {
                  router.push(link);
                }
              }}
              className="group/native flex text-Neutrals-7 transition-all hover:dark:text-white cursor-pointer py-1 gap-2"
            >
              <menu.customIcon></menu.customIcon>
              <span>{menu.title}</span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default NativeNavigation;
