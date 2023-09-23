import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import WorkspaceDropdown from './workspaceDropdown';
import { getFolders } from '@/lib/supabase/queries';
import { ScrollArea } from '../ui/scroll-area';
import TempDropdown from './tempDropdown';
import NativeNavigation from './nativeNavigation';

interface SidebarProps {
  params: { workspaceId: string };
}

const Sidebar: React.FC<SidebarProps> = async ({ params }) => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const workspaceFolders = await getFolders(params.workspaceId);
  if (user) {
    //WIP rout the user back to dashboard root if the urls they entered were wrong
    return (
      <div className=" hidden md:flex md:flex-col  w-[280px] shrink-0 p-4">
        <WorkspaceDropdown workspaceId={params.workspaceId} />
        <NativeNavigation myWorkspaceId={params.workspaceId} />
        <ScrollArea className="overflow-scroll relative h-full">
          <div className="pointer-events-none w-full absolute top-0 h-12 bg-gradient-to-b from-background to-transparent z-40" />
          <div className="pointer-events-none w-full absolute bottom-0 h-12 bg-gradient-to-t from-background to-transparent z-40" />
          <TempDropdown workspaceFolders={workspaceFolders} />
        </ScrollArea>
      </div>
    );
  }
};

export default Sidebar;
