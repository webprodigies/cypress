import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import WorkspaceSelect from './workspaceSelect';
import {
  getPrivateWorkspaces,
  getCollaboratingWorkspaces,
  getSharedWorkspaces,
} from '@/lib/supabase/queries';
import { ScrollArea } from './ui/scroll-area';
import ListWorkspaces from './listWorkSpaces';

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
      <div className=" hidden md:flex md:flex-col  w-[280px] shrink-0 p-4">
        <WorkspaceSelect
          privateWorkspaces={privateWorkspaces}
          collaboratingWorkspaces={collaboratedWorkspaces}
          sharedWorkspaces={sharedWorkspaces}
        />
        <ScrollArea className="overflow-scroll relative h-full">
          <div className="pointer-events-none w-full absolute top-0 h-20 bg-gradient-to-b from-background to-transparent z-40" />
          <div className="pointer-events-none w-full absolute bottom-0 h-20 bg-gradient-to-t from-background to-transparent z-40" />
          {/* {privateWorkspaces && (
            <ListWorkspaces
              className="mt-12"
              workspaceCategory={privateWorkspaces}
              listTitle="PRIVATE"
            />
          )}
          {sharedWorkspaces && (
            <ListWorkspaces
              workspaceCategory={sharedWorkspaces}
              listTitle="SHARED"
            />
          )}
          {collaboratedWorkspaces && (
            <ListWorkspaces
              workspaceCategory={collaboratedWorkspaces}
              listTitle="COLLABORATING"
              className="mb-10"
            />
          )} */}
        </ScrollArea>
      </div>
    );
  }
};

export default Sidebar;
