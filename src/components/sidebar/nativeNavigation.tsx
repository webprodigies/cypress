'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { FC } from 'react';
import CypressHomeIcon from '../icons/cypressHomeIcon';
import CypressMessageIcon from '../icons/cypressMessageIcon';
import CypressSettingsIcon from '../icons/cypressSettingsIcon';
import CypressMarketPlaceIcon from '../icons/cypressMarketIcon';
import CypressTemplateIcon from '../icons/cypressTemplatesIcon';

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
    title: 'Marketplace',
    id: 'marketplace',
    customIcon: CypressMarketPlaceIcon,
  },
  {
    title: 'Templates',
    id: 'templates',
    customIcon: CypressTemplateIcon,
  },
] as const;

interface NativeNavigationProps {
  myWorkspaceId: string;
}
const NativeNavigation: FC<NativeNavigationProps> = ({ myWorkspaceId }) => {
  const router = useRouter();
  return (
    <nav className="my-2">
      <ul>
        {nativeNavigations.map((menu) => {
          const link =
            menu.id === 'dashboard' ? `/dashboard/${myWorkspaceId}` : '';
          return (
            // WIP Add links for others too
            <li
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
