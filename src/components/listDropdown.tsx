'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { ICON_NAMES } from '@/lib/constants';

import { getFolders } from '@/lib/supabase/queries';
import { Folder } from '@/lib/supabase/supabase.types';
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
  const [files, setFiles] = useState([]);
  const router = useRouter();
  const pathname = usePathname();

  const defaultValue = useMemo(() => {
    const defVal = pathname.replace('/dashboard/', '').split('/');
    if (defVal.length === 1) return [`workspace/${defVal[0]}`];
    if (defVal.length === 2)
      return [`workspace/${defVal[0]}`, `folder/${defVal[1]}`];
    if (defVal.length === 3)
      return [
        `workspace/${defVal[0]}`,
        `folder/${defVal[1]}`,
        `file/${defVal[2]}`,
      ];

    return [''];
  }, []);

  const fetchData = async (
    id: string,
    type: 'workspace' | 'folder' | 'file'
  ) => {
    if (type === 'workspace') {
      const workspaceId = id.split('workspace/')[1];
      const response = await getFolders(workspaceId);
      router.push(workspaceId);
      setFolders(response);
    }
    if (type === 'folder') {
      const folderId = id.split('folder/')[2];
    }
  };

  useEffect(() => {
    const getDefaultData = async () => {
      const path = pathname.replace('/dashboard/', '').split('/');
      if (pathname.includes(id)) {
        console.log(path);
        if (path.length === 1) {
          console.log(defaultValue);
          const response = await getFolders(id);
          setFolders(response);
        }
        if (path.length === 2) {
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
        title={title}
        listType="workspace"
        id={`workspace/${id}`}
        iconId={iconId}
        onClick={fetchData}
        disabled={disabled}
      >
        {folders.map((folder, index) => (
          <Dropdown
            key={folder.folderId}
            title={folder.title}
            listType="folder"
            id={`folder/${folder.folderId}`}
            iconId={folder.iconId}
            onClick={fetchData}
            disabled={disabled}
          >
            {files.map((_, index) => (
              <Dropdown
                key={index}
                title={title}
                listType="file"
                id={id}
                iconId={iconId}
                onClick={fetchData}
                disabled={disabled}
              ></Dropdown>
            ))}
          </Dropdown>
        ))}
      </Dropdown>
    </Accordion>
  );
};
