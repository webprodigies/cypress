'use client';
import Image from 'next/image';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import Logo from '../../../public/cypresslogo.svg';
import { workspace } from '@/lib/supabase/supabase.types';
import { useAppState } from '@/lib/providers/state-provider';
import Link from 'next/link';
import CustomDialogTrigger from '../customDialogTrigger';
import WorkspaceCreator from '@/components/workspaceCreator';

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
  const { dispatch } = useAppState();
  const [selectedOption, setSelectedOption] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
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

  return (
    <div className="relative inline-block text-left">
      <div className="">
        <span onClick={() => setIsOpen(!isOpen)}>
          {selectedOption ? (
            <SelectedOption workspace={selectedOption} />
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
                <SelectedOption
                  workspace={option}
                  onClick={() => {
                    handleSelect(option);
                  }}
                />
              ))}
              <p className="text-muted-foreground">Shared</p>
              <hr />
              {sharedWorkspaces.map((option) => (
                <SelectedOption
                  workspace={option}
                  onClick={() => {
                    handleSelect(option);
                  }}
                />
              ))}
              <p className="text-muted-foreground">Collaborating</p>
              <hr />
              {collaboratingWorkspaces.map((option) => (
                <SelectedOption
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

interface SelectedOptionProps {
  workspace: workspace;
  onClick?: () => void;
}

const SelectedOption: FC<SelectedOptionProps> = ({ workspace, onClick }) => {
  return (
    <Link
      href={`/dashboard/${workspace.id}`}
      onClick={() => {
        if (onClick) onClick();
      }}
      className="flex rounded-md hover:bg-muted transition-all flex-row p-2 gap-4 justify-center cursor-pointer items-center my-2 "
    >
      <div className="relative h-[30px] w-[30px]">
        <Image
          src={Logo}
          alt="Workspace Logo"
          fill
        />
      </div>
      <div className="flex flex-col">
        <p className="text-lg w-[170px] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {workspace.title}
        </p>
      </div>
    </Link>
  );
};

export default WorkspaceSelector;
