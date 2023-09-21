import React from 'react';

import {
  CollaboratedWorkspaces,
  PrivateWorkspaces,
  SharedWorkspaces,
  WorkspacesWithIconIds,
} from '@/lib/supabase/supabase.types';
import { Accordion } from '@/components/ui/accordion';

import { PlusIcon } from 'lucide-react';
import { MultipleDropdownContainer } from './listDropdown';
import TooltipComponent from './tooltip';
import { createPrivateWorkspace } from '@/lib/supabase/queries';
import CustomDialogTrigger from './customDialogTrigger';
import WorkspaceEditor from './workspaceEditor';

interface ListWorkspacesProps {
  workspaceCategory:
    | SharedWorkspaces
    | PrivateWorkspaces
    | CollaboratedWorkspaces
    | [];
  listTitle?: 'PRIVATE' | 'COLLABORATING' | 'SHARED';
  className?: string;
  params?: { params: { slug: string } };
}

const ListWorkspaces: React.FC<ListWorkspacesProps> = async ({
  workspaceCategory,
  listTitle,
  className,
}) => {
  const addPrivateWorkspace = async (workspace: WorkspacesWithIconIds) => {
    const privateWorkspace: WorkspacesWithIconIds = workspace;
    await createPrivateWorkspace(privateWorkspace);
  };

  return (
    <React.Fragment>
      <div className="flex mt-6 h-6 group/title justify-between items-center mb-2 pr-4 text-Neutrals-8">
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
          <MultipleDropdownContainer
            id={workspaceId}
            title={title}
            key={workspaceId}
            iconId={iconId}
            disabled={false}
          />
        )
      )}
    </React.Fragment>
  );
};

export default ListWorkspaces;
///Listen to stuff from the folders table.
// const [optimisticPrivateWorkspaces, optimisticSetPrivateWorkspaces] =
//   useOptimistic<PrivateWorkspaces[], PrivateWorkspaces>(
//     workspaceCategory as PrivateWorkspaces[],
//     (state: PrivateWorkspaces[], newWorkspaceItem: PrivateWorkspaces) => [
//       newWorkspaceItem,
//       ...state,
//     ]
//   );
