import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import WorkspaceDropdown from './workspaceDropdown';
import { getFolders } from '@/lib/supabase/queries';
import { ScrollArea } from '../ui/scroll-area';
import TempDropdown from './tempDropdown';
import NativeNavigation from './nativeNavigation';
import TooltipComponent from '../tooltip';
import CustomDialogTrigger from '../customDialogTrigger';
import WorkspaceEditor from '../workspaceEditor';
import { PlusIcon, Search } from 'lucide-react';
import PlanUsage from './planUsage';
import { Input } from '../ui/input';
import UserCard from './userCard';

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
      <div className=" hidden md:flex md:flex-col  w-[280px] shrink-0 p-4 md:gap-4 ">
        <WorkspaceDropdown workspaceId={params.workspaceId} />
        <PlanUsage />
        <NativeNavigation myWorkspaceId={params.workspaceId} />
        <ScrollArea className="overflow-scroll relative h-full ">
          <div className="flex sticky z-50 top-0 bg-background w-full  h-10 group/title justify-between items-center pr-4 text-Neutrals-8">
            <span className="text-Neutrals-8 font-bold text-xs">FOLDERS</span>
            <TooltipComponent message="Create Folder">
              <CustomDialogTrigger
                header="Create a new workspace"
                description="Workspaces allow you to organize pages and folders that can be private or shared with collaborators"
                content={<WorkspaceEditor type="folder" />}
              >
                <PlusIcon
                  size={16}
                  className="group-hover/title:inline-block hidden cursor-pointer hover:dark:text-white"
                />
              </CustomDialogTrigger>
            </TooltipComponent>
          </div>
          <div className="pointer-events-none w-full absolute bottom-0 h-20 bg-gradient-to-t from-background to-transparent z-40" />
          <TempDropdown workspaceFolders={workspaceFolders} />
        </ScrollArea>
        <UserCard />
      </div>
    );
  }
};

export default Sidebar;
