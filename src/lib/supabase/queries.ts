'use server';

import { and, eq, ilike, notExists } from 'drizzle-orm';
import {
  collaborators,
  files,
  folders,
  profiles,
  workspaces,
} from '../../../migrations/schema';
import db from './db';
import {
  File,
  Folder,
  Profile,
  Subscription,
  workspace,
} from './supabase.types';
import { revalidatePath } from 'next/cache';
import { validate } from 'uuid';

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
      data: workspaces.data,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
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
    )) as [workspace];
  return privateWorkspaces;
};

export const createWorkspace = async (workspace: workspace) => {
  try {
    const response = await db.insert(workspaces).values(workspace);
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};

export const updateWorkspace = async (
  updatedWorkspace: Partial<workspace>,
  workspaceId: string
) => {
  if (!workspaceId) return;
  await db
    .update(workspaces)
    .set(updatedWorkspace)
    .where(eq(workspaces.id, workspaceId));
  revalidatePath(`/dashboard/${workspaceId}`);
};

export const addCollaborators = async (
  profiles: Profile[],
  workspaceId: string
) => {
  const response = profiles.forEach(async (profile: Profile) => {
    const userExists = await db.query.collaborators.findFirst({
      where: (p, { eq }) =>
        and(eq(p.userId, profile.id), eq(p.workspaceId, workspaceId)),
    });
    if (!userExists)
      await db
        .insert(collaborators)
        .values({ workspaceId, userId: profile.id });
  });
};

export const removeCollaborators = async (
  profiles: Profile[],
  workspaceId: string
) => {
  const response = profiles.forEach(async (profile: Profile) => {
    const userExists = await db.query.collaborators.findFirst({
      where: (p, { eq }) =>
        and(eq(p.userId, profile.id), eq(p.workspaceId, workspaceId)),
    });
    if (userExists)
      await db
        .delete(collaborators)
        .where(
          and(
            eq(collaborators.workspaceId, workspaceId),
            eq(collaborators.userId, profile.id)
          )
        );
  });
};

export const getCollaborators = async (
  workspaceId: string
): Promise<Profile[]> => {
  const response = await db
    .select()
    .from(collaborators)
    .where(eq(collaborators.workspaceId, workspaceId));

  if (!response.length) return [];

  const usersInformation: Promise<Profile | undefined>[] = response.map(
    async (user) => {
      const exists = await db.query.profiles.findFirst({
        where: (p, { eq }) => eq(p.id, user.userId),
      });
      return exists;
    }
  );

  const resolvedUsers = await Promise.all(usersInformation);
  return resolvedUsers.filter(Boolean) as Profile[]; // Remove any null or undefined values
};
export const getProfiles = async (
  email: string,
  userEmail: string | undefined
) => {
  if (!email || !userEmail) return [];
  const accounts = db
    .select()
    .from(profiles)
    .where(ilike(profiles.email, `${email}%`));
  return accounts;
};

export const findProfile = async (userId: string) => {
  const response = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.id, userId),
  });

  return response;
};

export const updateProfile = async (
  profile: Partial<Profile>,
  userId: string
) => {
  if (!userId) return;
  const response = await db
    .update(profiles)
    .set(profile)
    .where(eq(profiles.id, userId));
  return response;
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
      data: workspaces.data,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
    })
    .from(profiles)
    .innerJoin(collaborators, eq(profiles.id, collaborators.userId))
    .innerJoin(workspaces, eq(collaborators.workspaceId, workspaces.id))
    .where(eq(profiles.id, userId))) as [workspace];
  return collaboratedWorkspaces;
};

export const getSharedWorkspaces = async (userId: string) => {
  if (!userId) return [];
  const sharedWorkspaces = (await db
    .selectDistinct({
      id: workspaces.id,
      createdAt: workspaces.createdAt,
      workspaceOwner: workspaces.workspaceOwner,
      title: workspaces.title,
      iconId: workspaces.iconId,
      data: workspaces.data,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
    })
    .from(workspaces)
    .orderBy(workspaces.createdAt)
    .innerJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
    .where(eq(workspaces.workspaceOwner, userId))) as [workspace];
  return sharedWorkspaces;
};

export const getFolders = async (workspaceId: string) => {
  const isValid = validate(workspaceId);
  if (!isValid) {
    return { data: null, error: 'Error' };
  }

  try {
    const results =
      ((await db
        .select()
        .from(folders)
        .orderBy(folders.createdAt)
        .where(and(eq(folders.workspaceId, workspaceId)))) as Folder[]) || [];

    return { data: results, error: null };
  } catch (error) {
    return { data: null, error: 'Error' };
  }
};

export const createFolder = async (folder: Folder) => {
  const results = await db.insert(folders).values(folder);
};

export const createFile = async (file: File) => {
  const results = await db.insert(files).values(file);
};

export const getFiles = async (folderId: string) => {
  const isValid = validate(folderId);
  if (!isValid) {
    return { data: null, error: 'Error' };
  }

  try {
    const results =
      ((await db
        .select()
        .from(files)
        .orderBy(files.createdAt)
        .where(and(eq(files.folderId, folderId)))) as File[]) || [];
    return { data: results, error: null };
  } catch (error) {
    return { data: null, error: 'Error' };
  }
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
    .where(eq(files.id, fileId));
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

export const sendFolderToTrash = async (folderId: string, message: string) => {
  const response = await db
    .update(folders)
    .set({ inTrash: message })
    .where(eq(folders.folderId, folderId));

  const { data, error } = await getFiles(folderId);
  if (data)
    data.map(async (file) => {
      await db
        .update(files)
        .set({
          inTrash: message,
        })
        .where(eq(files.folderId, folderId));
    });
};
export const restoreFolder = async (folderId: string) => {
  const response = await db
    .update(folders)
    .set({ inTrash: '' })
    .where(eq(folders.folderId, folderId));
  const { data, error } = await getFiles(folderId);
  if (data)
    data.map(async (file) => {
      await db
        .update(files)
        .set({ inTrash: '' })
        .where(eq(files.folderId, folderId));
    });
};

export const sendFileToTrash = async (fileId: string, message: string) => {
  const response = await db
    .update(files)
    .set({ inTrash: message })
    .where(eq(files.id, fileId));
};

export const restoreFile = async (fileId: string) => {
  const response = await db
    .update(files)
    .set({ inTrash: '' })
    .where(eq(files.id, fileId));
};

export const getWorkspaceDetails = async (workspaceId: string) => {
  const isValid = validate(workspaceId);
  if (!isValid) {
    data: [];
    error: 'Error';
  }

  try {
    const response = (await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1)) as workspace[];

    return { data: response, error: null };
  } catch (error) {
    return { data: [], error: 'Error' };
  }
};

export const getFolderDetails = async (folderId: string) => {
  const isValid = validate(folderId);
  if (!isValid) {
    data: [];
    error: 'Error';
  }

  try {
    const response = (await db
      .select()
      .from(folders)
      .where(eq(folders.folderId, folderId))
      .limit(1)) as Folder[];

    return { data: response, error: null };
  } catch (error) {
    return { data: [], error: 'Error' };
  }
};

export const getFileDetails = async (fileId: string) => {
  const isValid = validate(fileId);
  if (!isValid) {
    data: [];
    error: 'Error';
  }
  try {
    const response = (await db
      .select()
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1)) as File[];
    return { data: response, error: null };
  } catch (error) {
    return { data: [], error: 'Error' };
  }
};

export const deleteFile = async (fileId: string) => {
  if (!fileId) return;
  await db.delete(files).where(eq(files.id, fileId));
};

export const deleteFolder = async (folderId: string) => {
  if (!folderId) return;
  await db.delete(folders).where(eq(folders.folderId, folderId));
};

export const deleteWorkspace = async (workspaceId: string) => {
  if (!workspaceId) return;
  await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
};

export const updateFolder = async (
  updatedFolder: Partial<Folder>,
  folderId: string
) => {
  if (!folderId) return;
  await db
    .update(folders)
    .set(updatedFolder)
    .where(eq(folders.folderId, folderId));
};

export const updateFile = async (
  updatedFile: Partial<File>,
  fileId: string
) => {
  if (!fileId) return;
  await db.update(files).set(updatedFile).where(eq(files.id, fileId));
};

export const getActiveProductsWithPrices = async () => {
  try {
    const res = await db.query.products.findMany({
      where: (pro, { eq }) => eq(pro.active, true),
      with: {
        prices: {
          where: (pri, { eq }) => eq(pri.active, true),
        },
      },
    });
    if (res.length) return { data: res, error: null };

    return { data: [], error: null };
  } catch (error) {
    console.log(error);
    return { data: [], error };
  }
};

export const getUserSubscriptionStatus = async (userId: string) => {
  try {
    const data = await db.query.subscriptions.findFirst({
      where: (s, { eq }) => eq(s.userId, userId),
    });
    if (data) return { data: data as Subscription, error: null };
    else return { data: null, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: 'Error' };
  }
};
