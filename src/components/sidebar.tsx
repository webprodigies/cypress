import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';

import Logo from '../../public/cypresslogo.svg';
import { UserButton } from './userButton';
import ListWorkSpaces from './listWorkSpaces';
import {
  getPrivateWorkspaces,
  getCollaboratingWorkspaces,
  getSharedWorkspaces,
} from '@/lib/supabase/queries';
import { ScrollArea } from './ui/scroll-area';

interface SidebarProps {}

const Sidebar: React.FC<SidebarProps> = async () => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const [privateWorkspaces, collaboratedWorkspaces, sharedWorkspaces] =
      await Promise.all([
        getPrivateWorkspaces(user.id),
        getCollaboratingWorkspaces(user.id),
        getSharedWorkspaces(user.id),
      ]);

    return (
      <div className="dark:bg-Neutrals-12 bg-washed-purple-100 hidden md:flex md:flex-col  w-[250px] shrink-0 p-4">
        <UserButton />
        <ScrollArea className="overflow-scroll relative h-full">
          <div className="pointer-events-none w-full absolute top-0 h-20 bg-gradient-to-b from-Neutrals-12 to-transparent z-40" />
          <div className="pointer-events-none w-full absolute bottom-0 h-20 bg-gradient-to-t from-Neutrals-12 to-transparent z-40" />
          <div></div>
          {privateWorkspaces && (
            <ListWorkSpaces
              className="mt-12"
              workspaceCategory={privateWorkspaces}
              listTitle="PRIVATE"
            />
          )}
          {sharedWorkspaces && (
            <ListWorkSpaces
              workspaceCategory={sharedWorkspaces}
              listTitle="SHARED"
            />
          )}
          {collaboratedWorkspaces && (
            <ListWorkSpaces
              workspaceCategory={collaboratedWorkspaces}
              listTitle="COLLABORATING"
              className="mb-10"
            />
          )}
        </ScrollArea>
      </div>
    );
  }
};

export default Sidebar;
