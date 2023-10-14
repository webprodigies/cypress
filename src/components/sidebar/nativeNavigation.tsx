import Link from 'next/link';
import React, { FC } from 'react';
import CypressHomeIcon from '../icons/cypressHomeIcon';
import CypressSettingsIcon from '../icons/cypressSettingsIcon';
import CypressTrashIcon from '../icons/cypressTrashIcon';
import { twMerge } from 'tailwind-merge';
import Settings from '../settings/settings';
import Trash from '../trash/trash';

interface NativeNavigationProps {
  myWorkspaceId: string;
  className?: string;
  getSelectedElement?: (selection: string) => void;
}
const NativeNavigation: FC<NativeNavigationProps> = ({
  myWorkspaceId,
  className,
}) => {
  return (
    <nav className={twMerge('my-2', className)}>
      <ul className="flex flex-col">
        <li>
          <Link
            className=" group/native flex text-Neutrals-7 transition-all hover:dark:text-white cursor-pointer py-1 gap-2"
            href={`/dashboard/${myWorkspaceId}`}
          >
            <CypressHomeIcon />
            <span>My Workspace</span>
          </Link>
        </li>
        <Settings>
          <li className="group/native flex text-Neutrals-7 transition-all hover:dark:text-white cursor-pointer py-1 gap-2">
            <CypressSettingsIcon />
            <span>Settings</span>
          </li>
        </Settings>
        <Trash>
          <li className="group/native flex text-Neutrals-7 transition-all hover:dark:text-white cursor-pointer py-1 gap-2">
            <CypressTrashIcon />
            <span>Trash</span>
          </li>
        </Trash>
      </ul>
    </nav>
  );
};

export default NativeNavigation;
