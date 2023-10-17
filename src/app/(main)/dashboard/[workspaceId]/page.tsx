export const dynamic = 'force-dynamic';

import React from 'react';
import QuillEditor from '@/components/quillEditor/quill';
import { redirect } from 'next/navigation';
import { getWorkspaceDetails } from '@/lib/supabase/queries';

const Workspace = async ({ params }: { params: { workspaceId: string } }) => {
  // Fetch workspace details based on the provided workspaceId
  const { data, error } = await getWorkspaceDetails(params.workspaceId);

  // If there's an error or no data for the workspace, redirect to the dashboard
  if (error || !data.length) redirect('/dashboard');

  // Render the QuillEditor component for the specified workspace
  return (
    <div className="relative">
      <QuillEditor
        dirType="workspace"
        fileId={params.workspaceId}
        dirDetails={data[0] || {}}
      ></QuillEditor>
    </div>
  );
};

export default Workspace;
