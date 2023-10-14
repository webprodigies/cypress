'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect } from 'react';
import { appFoldersType, useAppState } from '../providers/state-provider';
import { File } from '../supabase/supabase.types';
import { useRouter } from 'next/navigation';

const useSupabaseRealtime = () => {
  const supabase = createClientComponentClient();
  const { dispatch, state, workspaceId: selectedWorkspace } = useAppState();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'files',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            console.log('🟢 RECEIVED REAL TIME EVENT');
            const {
              folder_id: folderId,
              workspace_id: workspaceId,
              id: fileId,
            } = payload.new;

            if (
              !state.workspaces
                .find((workspace) => workspace.id === workspaceId)
                ?.folders.find((folder) => folder.folderId === folderId)
                ?.files.find((file) => file.id === fileId)
            ) {
              const newFile: File = {
                id: payload.new.id,
                workspaceId: payload.new.workspace_id,
                folderId: payload.new.folder_id,
                createdAt: payload.new.created_at,
                title: payload.new.title,
                iconId: payload.new.icon_id,
                data: payload.new.data,
                inTrash: payload.new.in_trash,
              };
              dispatch({
                type: 'ADD_FILE',
                payload: { file: newFile, folderId, workspaceId },
              });
            }
          } else if (payload.eventType === 'DELETE') {
            let workspaceId = '';
            let folderId = '';

            const fileExists = state.workspaces.some((workspace) =>
              workspace.folders.some((folder) =>
                folder.files.some((file) => {
                  if (file.id === payload.old.id) {
                    workspaceId = workspace.id;
                    folderId = folder.folderId;
                    return true; // Stop the iteration once the file is found
                  }
                })
              )
            );
            if (fileExists && workspaceId && folderId) {
              router.replace(`/dashboard/${workspaceId}`);
              dispatch({
                type: 'DELETE_FILE',
                payload: { fileId: payload.old.id, folderId, workspaceId },
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const { folder_id: folderId, workspace_id: workspaceId } =
              payload.new;
            state.workspaces.some((workspace) =>
              workspace.folders.some((folder) =>
                folder.files.some((file) => {
                  if (file.id === payload.new.id) {
                    dispatch({
                      type: 'UPDATE_FILE_DATA',
                      payload: {
                        workspaceId,
                        folderId,
                        fileId: payload.new.id,
                        file: {
                          title: payload.new.title,
                          iconId: payload.new.icon_id,
                          inTrash: payload.new.in_trash,
                        },
                      },
                    });
                    return true;
                  }
                })
              )
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public', // Replace with your schema
          table: 'folders', // Replace with your table name for folders
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { workspace_id: workspaceId, folder_id: folderId } =
              payload.new;

            if (
              !state.workspaces
                .find((workspace) => workspace.id === workspaceId)
                ?.folders.find((folder) => folder.folderId === folderId)
            ) {
              const newFolder: appFoldersType = {
                data: null,
                folderId: payload.new.folder_id,
                workspaceId: payload.new.workspace_id,
                createdAt: payload.new.created_at,
                title: payload.new.title,
                iconId: payload.new.icon_id,
                inTrash: payload.new.in_trash,
                files: [], // Initialize files as an empty array
              };
              dispatch({
                type: 'ADD_FOLDER',
                payload: { folder: newFolder, workspaceId },
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const folderId = payload.old.folder_id;
            router.replace(`/dashboard/${selectedWorkspace}`);
            dispatch({
              type: 'DELETE_FOLDER',
              payload: { folderId },
            });
          } else if (payload.eventType === 'UPDATE') {
            const folderId = payload.new.folder_id;
            const workspaceId = payload.new.workspace_id;
            const localFolder = state.workspaces
              .find((workspace) => workspace.id === payload.new.workspace_id)
              ?.folders.find(
                (folder) => folder.folderId === payload.new.folder_id
              );
            if (!localFolder) return;
            if (
              localFolder.title !== payload.new.title ||
              localFolder.iconId !== payload.new.icon_id
            ) {
              dispatch({
                type: 'UPDATE_FOLDER_DATA',
                payload: {
                  workspaceId,
                  folderId,
                  folder: {
                    title: payload.new.title,
                    iconId: payload.new.icon_id,
                  },
                },
              });
            } else if (localFolder?.inTrash !== payload.new.in_trash) {
              dispatch({
                type: 'UPDATE_FOLDER_DATA',
                payload: {
                  workspaceId,
                  folderId,
                  folder: {
                    inTrash: payload.new.in_trash,
                  },
                },
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      // Unsubscribe when the component unmounts
      channel.unsubscribe();
    };
  }, [supabase, state, selectedWorkspace]);

  return null;
};

export default useSupabaseRealtime;
