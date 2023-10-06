'use client';
import { File, Folder, workspace } from '@/lib/supabase/supabase.types';
import React, { FC, useEffect, useMemo, useState } from 'react';
import ClientAccordian from './clientAccordian';
import { Dropdown } from './Dropdown';
import { AppState, useAppState } from '@/lib/providers/state-provider';
import useRealtimeFiles from '@/lib/hooks/useRealtimeFiles';
import TooltipComponent from '../tooltip';
import { PlusIcon } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { createFolder } from '@/lib/supabase/queries';

interface TempDropdownProps {
  workspaceFolders: Folder[];
  workspaceId: string;
}

const TempDropdown: FC<TempDropdownProps> = ({
  workspaceFolders,
  workspaceId,
}) => {
  useRealtimeFiles();
  const { state, dispatch } = useAppState();
  // Use a local state variable to track whether to use server data or local state
  const [useServerData, setUseServerData] = useState(true);

  // Set initial state based on server data when it's available
  useEffect(() => {
    if (workspaceFolders.length > 0) {
      dispatch({
        type: 'SET_FOLDERS',
        payload: {
          workspaceId,
          folders: workspaceFolders.map((folder) => ({
            ...folder,
            files:
              state.workspaces
                .find((workspace) => workspace.id === workspaceId)
                ?.folders?.find((f) => f.folderId === folder.folderId)?.files ||
              [],
          })),
        },
      });

      // Update the local state variable to indicate that server data has been used
      setUseServerData(false);
    }
  }, [workspaceFolders, workspaceId]);

  // Define folders based on whether to use server data or local state
  const folders = useMemo(() => {
    if (useServerData) {
      return workspaceFolders;
    } else {
      const stateWorkspaceFolders =
        state.workspaces.find((workspace) => workspace.id === workspaceId)
          ?.folders || [];

      return stateWorkspaceFolders;
    }
  }, [state, workspaceFolders, workspaceId, useServerData]);

  useEffect(() => {
    console.log(folders, 'THIS IS WHAT IT IS USING');
  }, [folders]);

  const addFolderHandler = async () => {
    const newFolder: Folder = {
      data: null,
      folderId: uuid(),
      createdAt: new Date().toISOString(),
      title: 'Untitled',
      iconId: '📄',
      inTrash: null,
      workspaceId,
    };
    dispatch({
      type: 'ADD_FOLDER',
      payload: { workspaceId, folder: { ...newFolder, files: [] } },
    });
    await createFolder(newFolder);
  };

  return (
    <>
      <div className="flex sticky z-50 top-0 bg-background w-full  h-10 group/title justify-between items-center pr-4 text-Neutrals-8">
        <span className="text-Neutrals-8 font-bold text-xs">FOLDERS</span>
        <TooltipComponent message="Create Folder">
          <PlusIcon
            onClick={addFolderHandler}
            size={16}
            className="group-hover/title:inline-block hidden cursor-pointer hover:dark:text-white"
          />
        </TooltipComponent>
      </div>

      <ClientAccordian className="pb-20">
        {folders
          .filter((folder) => !folder.inTrash)
          .map((folder) => (
            <Dropdown
              key={folder.folderId}
              title={folder.title}
              listType="folder"
              id={`${folder.folderId}`}
              iconId={folder.iconId}
            />
          ))}
      </ClientAccordian>
    </>
  );
};

export default TempDropdown;
