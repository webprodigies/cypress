'use client';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { File } from '../supabase/supabase.types';
import { usePathname } from 'next/navigation';
import { getFiles } from '../supabase/queries';

export type FoldersContextType = {
  folders: { folderId: string; files: File[] }[] | [];
  setFolders: React.Dispatch<
    React.SetStateAction<{ folderId: string; files: File[] }[] | []>
  >;
};
const FoldersContext = createContext<FoldersContextType>({
  folders: [],
  setFolders: () => {},
});

export const useFolders = () => {
  return useContext(FoldersContext);
};

export const FolderProvider = ({ children }: { children: ReactNode }) => {
  const [folders, setFolders] = useState<
    { folderId: string; files: File[] }[] | []
  >([]);

  const pathname = usePathname();
  const folderId = useMemo(() => {
    const folderSegments = pathname?.split('/').filter(Boolean);
    if (folderSegments?.length === 3) {
      return folderSegments[2];
    }
  }, [pathname]);

  useEffect(() => {
    if (folders.find((folder) => folder.folderId === folderId) || !folderId)
      return;
    const fetchFiles = async () => {
      const response = await getFiles(folderId);
      setFolders([...folders, { folderId, files: response }]);
    };
    fetchFiles();
  }, [folderId]);

  return (
    <FoldersContext.Provider value={{ folders, setFolders }}>
      {children}
    </FoldersContext.Provider>
  );
};
