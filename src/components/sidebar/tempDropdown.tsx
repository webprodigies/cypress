import { Folder } from '@/lib/supabase/supabase.types';
import React, { FC, useEffect } from 'react';
import ClientAccordian from './clientAccordian';
import { Dropdown } from './Dropdown';

interface TempDropdownProps {
  workspaceFolders: Folder[];
}

const TempDropdown: FC<TempDropdownProps> = ({ workspaceFolders }) => {
  return (
    <ClientAccordian className='pb-20'>
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
