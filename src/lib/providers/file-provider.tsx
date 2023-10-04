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

export type FilesContextType = {
  files: { folderId: string; files: File[] }[] | [];
  setFiles: React.Dispatch<
    React.SetStateAction<{ folderId: string; files: File[] }[] | []>
  >;
};
const FilesContext = createContext<FilesContextType>({
  files: [],
  setFiles: () => {},
});

export const useFiles = () => {
  return useContext(FilesContext);
};

export const FilesProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<
    { folderId: string; files: File[] }[] | []
  >([]);

  const pathname = usePathname();
  const folderId = useMemo(() => {
    const folderSegments = pathname?.split('/').filter(Boolean);
    if (folderSegments?.length === 3 || folderSegments?.length === 4) {
      return folderSegments[2];
    }
  }, [pathname]);

  useEffect(() => {
    if (files.find((folder) => folder.folderId === folderId) || !folderId)
      return;
    const fetchFiles = async () => {
      const response = await getFiles(folderId);
      setFiles([...files, { folderId, files: response }]);
    };
    fetchFiles();
  }, [folderId]);

  return (
    <FilesContext.Provider value={{ files, setFiles }}>
      {children}
    </FilesContext.Provider>
  );
};
