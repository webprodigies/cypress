'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ICON_NAMES } from '@/lib/constants';

import { getFiles, getFolders } from '@/lib/supabase/queries';
import { File, Folder } from '@/lib/supabase/supabase.types';
import { Dropdown } from './Dropdown';
import { Accordion } from '@radix-ui/react-accordion';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

interface MultipleDropdownContainerProps {
  title: string;
  id: string;
  iconId: (typeof ICON_NAMES)[number];
  disabled: boolean;
}
export const MultipleDropdownContainer: React.FC<
  MultipleDropdownContainerProps
> = ({ title, id, iconId, disabled }) => {
  //CHANGED Have to add a new prop inside shadcn accordinan that will help hide the chevron.
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const selectedRef = useRef();
  const router = useRouter();
  const pathname = usePathname();

  const defaultValue = useMemo(() => {
    const defVal = pathname.replace('/dashboard/', '').split('/');
    if (defVal.length === 1) return [`${defVal[0]}`];
    if (defVal.length === 2) return [`${defVal[0]}`, `${defVal[1]}`];
    if (defVal.length === 3)
      return [`${defVal[0]}`, `${defVal[1]}`, `${defVal[2]}`];

    return [''];
  }, []);

  const fetchData = async (
    accordianId: string,
    id: string,
    type: 'workspace' | 'folder' | 'file'
  ) => {
    const [workspaceId, folderId, fileId] = accordianId
      .replace('dashboard', '')
      .split('/')
      .filter(Boolean);
    console.log(id);
    if (type === 'workspace' && workspaceId === id) {
      const response = await getFolders(workspaceId);
      setFolders(response);
    }
    if (type === 'folder' && folderId === id) {
      const response = await getFiles(folderId);
      setFiles(response);
    }
  };

  useEffect(() => {
    const getDefaultData = async () => {
      const path = pathname.replace('dashboard', '').split('/').filter(Boolean);
      //checking for path includes because we want it set the folders only for that specific workspace it
      //If you dont do this then by default all folders will have the same data
      if (path.includes(id)) {
        if (path[0]) {
          const response = await getFolders(path[0]);
          setFolders(response);
        }
        if (path[1]) {
          const response = await getFiles(path[1]);
          setFiles(response);
        }
      }
    };
    getDefaultData();
  }, []);

  return (
    // Workspace
    <Accordion
      defaultValue={defaultValue}
      type="multiple"
    >
      <Dropdown
        defaultValue={defaultValue}
        title={title}
        listType="workspace"
        route={`/dashboard/${id}`}
        id={`${id}`}
        iconId={iconId}
        onClick={fetchData}
        disabled={disabled}
      >
        {folders.map((folder, index) => (
          <Dropdown
            defaultValue={defaultValue}
            key={folder.folderId}
            title={folder.title}
            route={`/dashboard/${id}/${folder.folderId}`}
            listType="folder"
            id={`${folder.folderId}`}
            iconId={folder.iconId}
            onClick={fetchData}
            disabled={disabled}
          >
            {files.map((file, index) => (
              <Dropdown
                defaultValue={defaultValue}
                key={file.id}
                title={file.title}
                route={`/dashboard/${id}/${folder.folderId}/${file.id}`}
                listType="file"
                id={file.id}
                iconId={file.iconId}
                onClick={fetchData}
                disabled={disabled}
              />
            ))}
          </Dropdown>
        ))}
      </Dropdown>
    </Accordion>
  );
};
