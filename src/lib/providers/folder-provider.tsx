'use client';
import { ReactNode, createContext, useContext, useState } from 'react';
import { Folder } from '../supabase/supabase.types';

export type FoldersContextType = {
  folders: Folder[] | [];
  setFolders: React.Dispatch<React.SetStateAction<Folder[] | []>>;
};
const FoldersContext = createContext<FoldersContextType>({
  folders: [],
  setFolders: () => {},
});

export const useFolders = () => {
  return useContext(FoldersContext);
};

export const FolderProvider = ({ children }: { children: ReactNode }) => {
  const [folders, setFolders] = useState<Folder[] | []>([]);

  return (
    <FoldersContext.Provider value={{ folders, setFolders }}>
      {children}
    </FoldersContext.Provider>
  );
};
