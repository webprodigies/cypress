import React from 'react';

import {
  CollaboratedWorkspaces,
  PrivateWorkspaces,
  SharedWorkspaces,
  WorkspacesWithIconIds,
} from '@/lib/supabase/supabase.types';
import { Accordion } from '@/components/ui/accordion';

import { MoreHorizontalIcon, PlusIcon } from 'lucide-react';
import { ListDropdown } from './listDropdown';
import TooltipComponent from './tooltip';
import { createPrivateWorkspace } from '@/lib/supabase/queries';
import CustomDialogTrigger from './customDialogTrigger';
import WorkspaceEditor from './workspaceEditor';

interface ListWorkSpacesProps {
  workspaceCategory:
    | SharedWorkspaces
    | PrivateWorkspaces
    | CollaboratedWorkspaces
    | [];
  listTitle?: 'PRIVATE' | 'COLLABORATING' | 'SHARED';
  className?: string;
  params?: { params: { slug: string } };
}

const ListWorkSpaces: React.FC<ListWorkSpacesProps> = async ({
  workspaceCategory,
  listTitle,
  className,
}) => {
  ///Listen to stuff from the folders table.
  // const [optimisticPrivateWorkspaces, optimisticSetPrivateWorkspaces] =
  //   useOptimistic<PrivateWorkspaces[], PrivateWorkspaces>(
  //     workspaceCategory as PrivateWorkspaces[],
  //     (state: PrivateWorkspaces[], newWorkspaceItem: PrivateWorkspaces) => [
  //       newWorkspaceItem,
  //       ...state,
  //     ]
  //   );
  const addPrivateWorkspace = async (workspace: WorkspacesWithIconIds) => {
    const privateWorkspace: WorkspacesWithIconIds = workspace;
    await createPrivateWorkspace(privateWorkspace);
  };

  return (
    <Accordion
      type="multiple"
      className={className}
    >
      <div className="flex h-6 group/title justify-between items-center mb-2 pr-4 text-Neutrals-8">
        <span className="text-Neutrals-8 font-bold text-xs">{listTitle}</span>
        {listTitle === 'PRIVATE' && (
          <TooltipComponent message="Add Workspace">
            <CustomDialogTrigger
              header="Create a new workspace"
              description="Workspaces allow you to organize pages and folders that can be private or shared with collaborators"
              content={<WorkspaceEditor type="workspace" />}
            >
              <PlusIcon
                size={16}
                className="group-hover/title:inline-block hidden cursor-pointer hover:dark:text-white"
              />
            </CustomDialogTrigger>
          </TooltipComponent>
        )}
      </div>

      {workspaceCategory.map(
        ({ title = 'Your Workspace', id: workspaceId, iconId }) => (
          //WIP Ability to change icons
          <ListDropdown
            workspaceId={workspaceId}
            title={title}
            key={workspaceId}
            listType="workspace"
            createNew="folder"
            iconId={iconId}
          >
            {/* <ListDropdown
              workspaceId={workspaceId + 1}
              title={title}
              key={workspaceId}
              listType="folder"
              createNew="file"
              iconId={iconId}
            >
              <ListDropdown
                workspaceId={workspaceId + 2}
                title={title}
                key={workspaceId}
                listType="file"
                createNew="file"
                iconId={iconId}
              ></ListDropdown>
            </ListDropdown> */}
          </ListDropdown>
        )
      )}
    </Accordion>
  );
};

export default ListWorkSpaces;
/*

 <ol className="border-l-[1px] border-muted-foreground ml-3 pl-5">
                <li className="overflow-hidden overflow-ellipsis group/file relative ">
                  Home Stuffe
                  <div className=" px-2 dark:bg-Neutrals-12 bg-washed-purple-100 top-0 bottom-0 group-hover/file:flex hidden rounded-sm absolute right-0 items-center gap-2 justify-center">
                    <MoreHorizontalIcon
                      size={15}
                      className="hover:dark:text-white dark:text-Neutrals-7 transition-colors"
                    />
                  </div>
                </li>
              </ol>
*/
