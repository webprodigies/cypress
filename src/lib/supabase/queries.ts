'use server';

import { and, eq, isNull, ne, notExists, or } from 'drizzle-orm';
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
  workspace,
} from './supabase.types';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';

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
      .orderBy(folders.createdAt)
      .where(
        and(eq(folders.workspaceId, workspaceId), isNull(folders.inTrash))
      )) as Folder[] | [];
    return results;
  }
  return [];
};


export const createFolder = async (
  workspaceId: string,
  title: string,
  icon?: string
) => {
  if (!title || !workspaceId) return;
  const results = await db
    .insert(folders)
    .values({ title, workspaceId, iconId: icon ? icon : '📁' });
  revalidatePath('/');
};

export const createFile = async (
  folderId: string,
  title: string,
  fileId: string,
  iconId?: string
) => {
  if (!title || !folderId) return;
  const results = await db
    .insert(files)
    .values({ folderId, title, iconId: iconId ? iconId : '📜', id: fileId });
};

export const getFiles = async (folderId: string) => {
  if (!folderId) return [];
  if (folderId) {
    const results = (await db
      .select()
      .from(files)
      .orderBy(files.createdAt)
      .where(
        and(eq(files.folderId, folderId), isNull(files.inTrash))
      )) as File[];
    return results;
  }
  return [];
};

export const updateWorkspaceFile = async (
  workspaceId: string,
  data: string
) => {
  const response = await db
    .update(workspaces)
    .set({ data })
    .where(eq(workspaces.id, workspaceId));
};

export const updateFolderFile = async (folderId: string, data: string) => {
  const response = await db
    .update(folders)
    .set({ data })
    .where(eq(folders.folderId, folderId));
};

export const updateFileFile = async (fileId: string, data: string) => {
  const response = await db
    .update(files)
    .set({ data })
    .where(eq(files.id, fileId));
};

export const updateEmojiWorkspace = async (
  workspaceId: string,
  emoji: string
) => {
  try {
    const response = await db
      .update(workspaces)
      .set({ iconId: emoji ? emoji : '📁' })
      .where(eq(workspaces.id, workspaceId));
  } catch (er) {
    revalidatePath('/');
  }
};

export const updateEmojiFolder = async (folderId: string, emoji: string) => {
  const response = await db
    .update(folders)
    .set({ iconId: emoji ? emoji : '📁' })
    .where(eq(folders.folderId, folderId));
};

export const updateEmojiFile = async (fileId: string, emoji: string) => {
  const response = await db
    .update(files)
    .set({ iconId: emoji ? emoji : '📋' })
    .where(eq(files.folderId, fileId));
};

export const updateTitleFolder = async (folderId: string, title: string) => {
  const response = await db
    .update(folders)
    .set({ title })
    .where(eq(folders.folderId, folderId));
};

export const updateTitleFile = async (fileId: string, title: string) => {
  const response = await db
    .update(files)
    .set({ title })
    .where(eq(files.id, fileId));
};

export const sendFolderToTrash = async (folderId: string) => {
  const response = await db
    .update(folders)
    .set({ inTrash: 'This folder is in the trash' })
    .where(eq(folders.folderId, folderId));

  const resFiles = await getFiles(folderId);
  resFiles.map(async (file) => {
    await db
      .update(files)
      .set({
        inTrash: 'This page is in the trash because the folder was deleted',
      })
      .where(eq(files.folderId, folderId));
  });
};

//rgb(235, 87, 87)
