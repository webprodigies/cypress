'use server';
import { and, eq, ne, notExists, or } from 'drizzle-orm';
import {
  collaborators,
  files,
  folders,
  profiles,
  workspaces,
} from '../../../migrations/schema';
import db from './db';
import {
  CollaboratedWorkspaces,
  File,
  Folder,
  PrivateWorkspaces,
  SharedWorkspaces,
  WorkspacesWithIconIds,
} from './supabase.types';
import { randomUUID } from 'crypto';
import { OutputData } from '@editorjs/editorjs';

export const getPrivateWorkspaces = async (userId: string | null) => {
  if (!userId) {
    return [];
  }
  const privateWorkspaces = (await db
    .select({
      id: workspaces.id,
      createdAt: workspaces.createdAt,
      workspaceOwner: workspaces.workspaceOwner,
      title: workspaces.title,
      iconId: workspaces.iconId,
    })
    .from(workspaces)
    .where(
      and(
        notExists(
          db
            .select()
            .from(collaborators)
            .where(eq(collaborators.workspaceId, workspaces.id))
        ),
        eq(workspaces.workspaceOwner, userId)
      )
    )) as PrivateWorkspaces;

  // console.log('PRIVATE WORKSPACES', privateWorkspaces);
  return privateWorkspaces;
};

export const createPrivateWorkspace = async ({
  iconId,
  workspaceOwner,
  title,
}: {
  iconId: string;
  workspaceOwner: string;
  title: string;
}) => {
  if (iconId && workspaceOwner) {
    const response = await db
      .insert(workspaces)
      .values({ id: randomUUID(), workspaceOwner, iconId, title });
    return response;
  }
};

//These are the workspaces the user is collaborating on
export const getCollaboratingWorkspaces = async (userId: string) => {
  if (!userId) return [];
  const collaboratedWorkspaces = (await db
    .select({
      id: workspaces.id,
      createdAt: workspaces.createdAt,
      workspaceOwner: workspaces.workspaceOwner,
      title: workspaces.title,
      iconId: workspaces.iconId,
    })
    .from(profiles)
    .innerJoin(collaborators, eq(profiles.id, collaborators.userId))
    .innerJoin(workspaces, eq(collaborators.workspaceId, workspaces.id))
    .where(eq(profiles.id, userId))) as CollaboratedWorkspaces;
  // console.log('Collaborating Workspaces', collaboratedWorkspaces);
  return collaboratedWorkspaces;
};

export const getSharedWorkspaces = async (userId: string) => {
  if (!userId) return [];
  const sharedWorkspaces = (await db
    .select({
      id: workspaces.id,
      createdAt: workspaces.createdAt,
      workspaceOwner: workspaces.workspaceOwner,
      title: workspaces.title,
      iconId: workspaces.iconId,
    })
    .from(workspaces)
    .innerJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
    .where(eq(workspaces.workspaceOwner, userId))) as SharedWorkspaces;
  // console.log('Shared Workspaces', sharedWorkspaces);
  return sharedWorkspaces;
};

export const getFolders = async (workspaceId: string) => {
  if (workspaceId) {
    const results = (await db
      .select()
      .from(folders)
      .where(eq(folders.workspaceId, workspaceId))) as Folder[] | [];
    return results;
  }
  return [];
};

export const getFiles = async (folderId: string) => {
  if (!folderId) return [];
  if (folderId) {
    const results = (await db
      .select()
      .from(files)
      .where(eq(files.folderId, folderId))) as File[];
    return results;
  }
  return [];
};

///Listen to stuff from the folders table.
// const [optimisticPrivateWorkspaces, optimisticSetPrivateWorkspaces] =
//   useOptimistic<PrivateWorkspaces[], PrivateWorkspaces>(
//     workspaceCategory as PrivateWorkspaces[],
//     (state: PrivateWorkspaces[], newWorkspaceItem: PrivateWorkspaces) => [
//       newWorkspaceItem,
//       ...state,
//     ]
//   );

export const updateBlocks = async (workspaceId: string, blocks: any) => {
  const response = await db
    .update(workspaces)
    .set({ blocks: blocks })
    .where(eq(workspaces.id, workspaceId));
};
