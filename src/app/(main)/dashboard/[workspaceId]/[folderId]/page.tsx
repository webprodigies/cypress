export const dynamic = 'force-dynamic';

import React from 'react';
import QuillEditor from '@/components/quillEditor/quill';
import { getFolderDetails } from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';

const Folder = async ({ params }: { params: { folderId: string } }) => {
  const { data, error } = await getFolderDetails(params.folderId);
  if (error || !data.length) redirect('/dashboard');

  return (
    <div className="relative ">
      <QuillEditor
        dirType="folder"
        fileId={params.folderId}
        dirDetails={data[0] || {}}
      ></QuillEditor>
    </div>
  );
};

export default Folder;
