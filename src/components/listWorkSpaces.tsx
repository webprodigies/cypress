'use client';
import React, { useEffect, useState } from 'react';

import {
  CollaboratedWorkspaces,
  Folder,
  PrivateWorkspaces,
  SharedWorkspaces,
  WorkspacesWithIconIds,
} from '@/lib/supabase/supabase.types';
import { Accordion } from '@/components/ui/accordion';

import { MoreHorizontalIcon, PlusIcon } from 'lucide-react';
import { ListDropdown } from './listDropdown';
import TooltipComponent from './tooltip';
import {
  createPrivateWorkspace,
  getWorkspaceFolders,
} from '@/lib/supabase/queries';
import CustomDialogTrigger from './customDialogTrigger';
import WorkspaceEditor from './workspaceEditor';

interface ListWorkSpacesProps {
  listTitle?: 'PRIVATE' | 'COLLABORATING' | 'SHARED';
  className?: string;
  getListDetails: (
    userId: string | null
  ) => Promise<
    SharedWorkspaces | PrivateWorkspaces | CollaboratedWorkspaces | undefined
  >;
  userId: string;
}

const ListWorkSpaces: React.FC<ListWorkSpacesProps> = ({
  listTitle,
  className,
  getListDetails,
  userId,
}) => {
  const [workspaceDetails, setWorkspaceDetails] = useState<
    SharedWorkspaces | PrivateWorkspaces | CollaboratedWorkspaces | []
  >([]);

  const [workspaceFolders, setWorkspaceFolders] = useState<Folder[]>([]);

  const addPrivateWorkspace = async (workspace: WorkspacesWithIconIds) => {
    const privateWorkspace: WorkspacesWithIconIds = workspace;
    await createPrivateWorkspace(privateWorkspace);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const details = await getListDetails(userId);
        if (details) {
          setWorkspaceDetails(details);
        }
      } catch (error) {
        console.error('Error fetching workspace details:', error);
      }

      try {
        const folders = await getWorkspaceFolders(userId);
        setWorkspaceFolders(folders);
      } catch (error) {
        console.error('Error fetching workspace folders:', error);
      }
    };

    fetchData();
  }, [userId, getListDetails]);

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

      {workspaceDetails &&
        workspaceDetails.map(({ title = 'Your Workspace', id, iconId }) => (
          //WIP Ability to change icons
          <ListDropdown
            id={id}
            title={title}
            key={id}
            listType="workspace"
            createNew="folder"
            iconId={iconId}
          >
            <ListDropdown
              id={id + 1}
              title={title}
              key={id}
              listType="folder"
              createNew="file"
              iconId={iconId}
            >
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
            </ListDropdown>
          </ListDropdown>
        ))}
    </Accordion>
  );
};

export default ListWorkSpaces;
