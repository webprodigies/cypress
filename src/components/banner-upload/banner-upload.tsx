import React from 'react';
import CustomDialogTrigger from '../customDialogTrigger';
import BannerUploadForm from './banner-upload-form';
import {
  appFoldersType,
  appWorkspacesType,
} from '@/lib/providers/state-provider';
import { File, Folder, workspace } from '@/lib/supabase/supabase.types';

interface BannerUploadProps {
  children: React.ReactNode;
  className?: string;
  dirType: 'workspace' | 'file' | 'folder';
  id: string;
  details: appWorkspacesType | appFoldersType | File | workspace | Folder;
}

const BannerUpload: React.FC<BannerUploadProps> = ({
  details,
  id,
  dirType,
  children,
  className,
}) => {
  return (
    <CustomDialogTrigger
      header="Upload Banner"
      content={
        <BannerUploadForm
          details={details}
          dirType={dirType}
          id={id}
        />
      }
      className={className}
    >
      {children}
    </CustomDialogTrigger>
  );
};

export default BannerUpload;
