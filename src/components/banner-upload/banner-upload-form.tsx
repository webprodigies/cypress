'use client';
import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import Loader from '../loader';
import { v4 } from 'uuid';
import {
  updateFile,
  updateFolder,
  updateWorkspace,
} from '@/lib/supabase/queries';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  appFoldersType,
  appWorkspacesType,
  useAppState,
} from '@/lib/providers/state-provider';
import { File, Folder, workspace } from '@/lib/supabase/supabase.types';

interface BannerUploadFormProps {
  details: appWorkspacesType | appFoldersType | File | workspace | Folder;
  dirType: 'workspace' | 'file' | 'folder';
  id: string;
}
const BannerUploadForm: React.FC<BannerUploadFormProps> = ({
  details,
  dirType,
  id,
}) => {
  const supabase = createClientComponentClient();
  const { state, workspaceId, folderId, dispatch } = useAppState();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isUploading, errors },
  } = useForm<FieldValues>({
    mode: 'onSubmit',
    defaultValues: { banner: '' },
  });

  const onSubmitHandler: SubmitHandler<FieldValues> = async (values) => {
    const file = values.banner?.[0];
    if (!file || !id) return;
    try {
      let filePath = null;
      const uploadBannerImage = async () => {
        const { data, error } = await supabase.storage
          .from('file-banners')
          .upload(`banner-${id}`, file, {
            cacheControl: '5',
            upsert: true,
          });
        if (error) throw new Error();
        filePath = data.path;
      };

      if (dirType === 'file') {
        if (!workspaceId || !folderId) return;
        await uploadBannerImage();
        dispatch({
          type: 'UPDATE_FILE_DATA',
          payload: {
            file: { bannerUrl: filePath },
            fileId: id,
            folderId,
            workspaceId,
          },
        });
        await updateFile({ bannerUrl: filePath }, id);
      } else if (dirType === 'workspace') {
        if (!workspaceId) return;
        await uploadBannerImage();
        dispatch({
          type: 'UPDATE_WORKSPACE_DATA',
          payload: {
            workspace: { bannerUrl: filePath },
            workspaceId,
          },
        });
        await updateWorkspace({ bannerUrl: filePath }, id);
      } else if (dirType === 'folder') {
        if (!workspaceId || !folderId) return;
        await uploadBannerImage();
        dispatch({
          type: 'UPDATE_FOLDER_DATA',
          payload: {
            folderId: id,
            folder: { bannerUrl: filePath },
            workspaceId,
          },
        });
        await updateFolder({ bannerUrl: filePath }, id);
      }
    } catch (error) {}
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className="flex flex-col gap-2"
    >
      <Label
        className="text-sm text-muted-foreground"
        htmlFor="bannerImage"
      >
        Banner Image
      </Label>
      <Input
        id="bannerImage"
        type="file"
        accept="image/*"
        disabled={isUploading}
        className="bg-background"
        {...register('banner', { required: 'Banner Image is required' })}
      />
      <small className="text-red-600">
        {errors?.banner?.message?.toString()}
      </small>
      <Button
        disabled={isUploading}
        type="submit"
      >
        {!isUploading ? 'Upload Banner' : <Loader />}
      </Button>
    </form>
  );
};

export default BannerUploadForm;
