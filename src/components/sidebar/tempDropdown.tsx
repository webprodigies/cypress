import { Folder } from '@/lib/supabase/supabase.types';
import React, { FC } from 'react';
import ClientAccordian from './clientAccordian';
import { Dropdown } from './Dropdown';

interface TempDropdownProps {
  workspaceFolders: Folder[];
}

const TempDropdown: FC<TempDropdownProps> = async ({ workspaceFolders }) => {
  return (
    <ClientAccordian className="mt-10">
      {workspaceFolders.map((folder, index) => (
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
