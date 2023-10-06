'use client';
import { useAppState } from '@/lib/providers/state-provider';
import React, { FC, useEffect } from 'react';

interface WorkspaceClientHelperProps {
  allWorkspaces: any[];
}
const WorkspaceClientHelper: FC<WorkspaceClientHelperProps> = ({
  allWorkspaces,
}) => {
  const { dispatch, state } = useAppState();
  useEffect(() => {
    dispatch({
      type: 'SET_WORKSPACES',
      payload: allWorkspaces.map((workspace) => ({
        ...workspace,
        folders: [],
      })),
    });
  }, [allWorkspaces]);
  return null;
};

export default WorkspaceClientHelper;
