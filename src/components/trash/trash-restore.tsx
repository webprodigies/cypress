'use client';
import { appFoldersType, useAppState } from '@/lib/providers/state-provider';
import { File } from '@/lib/supabase/supabase.types';
import {
  File as FileIcon,
  FolderIcon,
  Recycle,
  RefreshCcw,
  TrashIcon,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Separator } from '../ui/separator';
import Link from 'next/link';

const TrashRestore = () => {
  const { state, dispatch, workspaceId } = useAppState();
  const [folders, setFolders] = useState<appFoldersType[] | []>([]);
  const [files, setFiles] = useState<File[] | []>([]);

  useEffect(() => {
    const stateFolders =
      state.workspaces
        .find((workspace) => workspaceId === workspaceId)
        ?.folders.filter((folder) => folder.inTrash) || [];
    setFolders(stateFolders);

    let stateFiles: File[] = [];

    state.workspaces
      .find((workspace) => workspace.id === workspaceId)
      ?.folders.forEach((folder) => {
        folder.files.forEach((file) => {
          if (file.inTrash) {
            stateFiles.push(file);
          }
        });
      });
    setFiles(stateFiles);
  }, [state]);
  //http://localhost:3000/dashboard/4c594ef4-e29a-4e71-9bd2-ac207afb00af/c205f8e8-ef41-4933-bba4-bb51a4839f81/0d4f26af-9f50-4d10-85a9-6d2b09767425
  return (
    <section>
      {!!folders.length && (
        <>
          <h3>Folders</h3>
          {folders.map((folder) => (
            <Link
              className=" hover:bg-muted rounded-md p-2 flex items-center justify-between"
              href={`/dashboard/${folder.workspaceId}/${folder.folderId}`}
            >
              <article>
                <aside className="flex items-center gap-2">
                  <FileIcon />
                  {folder.title}
                </aside>
              </article>
            </Link>
          ))}
        </>
      )}
      {!!files.length && (
        <>
          <h3>Files</h3>
          {files.map((file) => (
            <Link
              className=" hover:bg-muted rounded-md p-2 flex items-center justify-between"
              href={`/dashboard/${file.workspaceId}/${file.folderId}/${file.id}`}
            >
              <article>
                <aside className="flex items-center gap-2">
                  <FileIcon />
                  {file.title}
                </aside>
              </article>
            </Link>
          ))}
        </>
      )}
      {!files.length && !folders.length && (
        <div className=" text-muted-foreground absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
          No Items in Trash
        </div>
      )}
    </section>
  );
};

export default TrashRestore;
