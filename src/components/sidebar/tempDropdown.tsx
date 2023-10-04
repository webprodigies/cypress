'use client';
import { Folder } from '@/lib/supabase/supabase.types';
import React, { FC, useEffect } from 'react';
import ClientAccordian from './clientAccordian';
import { Dropdown } from './Dropdown';
import { useFolders } from '@/lib/providers/folder-provider';

interface TempDropdownProps {
  workspaceFolders: Folder[];
}

const TempDropdown: FC<TempDropdownProps> = ({ workspaceFolders }) => {
  const { setFolders } = useFolders();
  useEffect(() => {
    setFolders(workspaceFolders);
  }, [workspaceFolders]);
  return (
    <ClientAccordian className="pb-20">
      {workspaceFolders.map((folder) => (
        <Dropdown
          key={folder.folderId}
          title={folder.title}
          listType="folder"
          id={`${folder.folderId}`}
          iconId={folder.iconId}
        ></Dropdown>
      ))}
    </ClientAccordian>
  );
};

export default TempDropdown;
