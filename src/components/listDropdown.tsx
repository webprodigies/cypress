'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ICON_NAMES } from '@/lib/constants';

import { getFiles, getFolders } from '@/lib/supabase/queries';
import { File, Folder } from '@/lib/supabase/supabase.types';
import { Dropdown } from './Dropdown';
import { Accordion } from '@radix-ui/react-accordion';
import {
  usePathname,
  useRouter,
  useSelectedLayoutSegments,
} from 'next/navigation';

interface MultipleDropdownContainerProps {}
export const MultipleDropdownContainer: React.FC<
  MultipleDropdownContainerProps
> = ({}) => {
  //CHANGED Have to add a new prop inside shadcn accordinan that will help hide the chevron.
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const pathname = usePathname();
  const [workspaceId, folderId, fileId] = useSelectedLayoutSegments();
  const router = useRouter();

  useEffect(() => {
    const fetchFolders = async () => {
      if (workspaceId) {
        const response = await getFolders(workspaceId);
        setFolders(response);
      }
      if (folderId) {
        const response = await getFiles(folderId);
        setFiles(response);
      }
    };
    fetchFolders();
  }, []);

  useEffect(() => {
    const fetchFolders = async () => {
      const response = await getFolders(workspaceId);
      setFolders(response);
    };
    fetchFolders();
  }, [workspaceId]);

  useEffect(() => {
    console.log('foldersChanged');
    const fetchFolders = async () => {
      const response = await getFiles(folderId);
      setFiles(response);
    };
    fetchFolders();
  }, [folderId]);

  const fetchData = async (id: string, listType: 'folder' | 'file') => {
    console.log(id, listType);
    if (listType === 'file') {
      router.push(`/dashboard/${workspaceId}/${folderId}/${id}`);
      return;
    }
    if (listType === 'folder') {
      router.push(`/dashboard/${workspaceId}/${id}`);
    }
  };

  return (
    // Workspace
    <Accordion
      // defaultValue={defaultValue}
      className="mt-10"
      type="multiple"
      defaultValue={[workspaceId, folderId, fileId]}
    >
      {folders.map((folder, index) => (
        <Dropdown
          key={folder.folderId}
          title={folder.title}
          listType="folder"
          id={`${folder.folderId}`}
          iconId={folder.iconId}
          onClick={fetchData}
        >
          {files.map((file, index) => (
            <Dropdown
              key={file.id}
              title={file.title}
              listType="file"
              id={file.id}
              iconId={file.iconId}
              onClick={fetchData}
            />
          ))}
        </Dropdown>
      ))}
    </Accordion>
  );
};
