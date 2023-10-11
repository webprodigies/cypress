'use client';
import Image from 'next/image';
import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { workspace } from '@/lib/supabase/supabase.types';
import { useAppState } from '@/lib/providers/state-provider';
import CustomDialogTrigger from '../customDialogTrigger';
import WorkspaceCreator from '@/components/workspaceCreator';
import SelectedWorkspace from './selected-workspace';

interface WorkspaceSelectorProps {
  privateWorkspaces: workspace[] | [];
  sharedWorkspaces: workspace[] | [];
  collaboratingWorkspaces: workspace[] | [];
  defaultValue: workspace | undefined;
}

const WorkspaceSelector: FC<WorkspaceSelectorProps> = ({
  privateWorkspaces,
  sharedWorkspaces,
  collaboratingWorkspaces,
  defaultValue,
}) => {
  const { dispatch, state } = useAppState();
  const [selectedOption, setSelectedOption] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!state.workspaces.length)
      dispatch({
        type: 'SET_WORKSPACES',
        payload: [
          ...privateWorkspaces,
          ...sharedWorkspaces,
          ...collaboratingWorkspaces,
        ].map((workspace) => ({
          ...workspace,
          folders: [],
        })),
      });
  }, [privateWorkspaces, sharedWorkspaces, collaboratingWorkspaces]);

  const handleSelect = (option: workspace) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  useEffect(() => {
    console.log(
      'STATE CHANGED',
      privateWorkspaces,
      sharedWorkspaces,
      collaboratingWorkspaces
    );
  }, [state]);
  useEffect(() => {
    const findSelectedWorkspace = state.workspaces.find(
      (workspace) => workspace.id === defaultValue?.id
    );
    if (findSelectedWorkspace) setSelectedOption(findSelectedWorkspace);
  }, [state, defaultValue]);

  return (
    <div className="relative inline-block text-left">
      <div className="">
        <span onClick={() => setIsOpen(!isOpen)}>
          {selectedOption ? (
            <SelectedWorkspace workspace={selectedOption} />
          ) : (
            'Select an option'
          )}
        </span>
      </div>
      {isOpen && (
        <div className="origin-top-right absolute  w-full rounded-md shadow-md z-50 h-[190px] bg-black/10 backdrop-blur-lg group overflow-scroll border-[1px] border-muted">
          <div className="rounded-md flex flex-col">
            <div className=" !p-2">
              <p className="text-muted-foreground">Private</p>
              <hr />
              {privateWorkspaces.map((option) => (
                <SelectedWorkspace
                  key={option.id}
                  workspace={option}
                  onClick={() => {
                    handleSelect(option);
                  }}
                />
              ))}
              <p className="text-muted-foreground">Shared</p>
              <hr />
              {sharedWorkspaces.map((option) => (
                <SelectedWorkspace
                  key={option.id}
                  workspace={option}
                  onClick={() => {
                    handleSelect(option);
                  }}
                />
              ))}
              <p className="text-muted-foreground">Collaborating</p>
              <hr />
              {collaboratingWorkspaces.map((option) => (
                <SelectedWorkspace
                  key={option.id}
                  workspace={option}
                  onClick={() => {
                    handleSelect(option);
                  }}
                />
              ))}
            </div>
            <CustomDialogTrigger
              header="Create A Workspace"
              content={<WorkspaceCreator />}
              description="Workspaces give you the power to collaborate with others. You can change your workspace privacy settings after creating the workspace too."
            >
              <div className="flex transition-all hover:bg-muted justify-center items-center gap-2 p-2 w-full">
                <article className="text-slate-500 rounded-full bg-slate-800 w-4 h-4 flex items-center justify-center">
                  +
                </article>
                Create workspace
              </div>
            </CustomDialogTrigger>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSelector;
