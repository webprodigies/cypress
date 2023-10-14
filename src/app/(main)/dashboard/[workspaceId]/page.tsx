export const dynamic = 'force-dynamic'

import React from 'react';
import QuillEditor from '@/components/quillEditor/quill';
import { redirect } from 'next/navigation';
import { getWorkspaceDetails } from '@/lib/supabase/queries';

const Workspace = async ({ params }: { params: { workspaceId: string } }) => {
  const { data, error } = await getWorkspaceDetails(params.workspaceId);
  if (error || !data.length) redirect('/dashboard');

  return (
    <div className="relative ">
      <QuillEditor
        dirType="workspace"
        fileId={params.workspaceId}
        dirDetails={data[0] || {}}
      ></QuillEditor>
    </div>
  );
};

export default Workspace;
