import db from '@/lib/supabase/db';
import React from 'react';
import { workspaces } from '../../../../../migrations/schema';
import { eq } from 'drizzle-orm';
import { workspace } from '@/lib/supabase/supabase.types';
import QuillEditor from '@/components/quillEditor/quill';

const Workspace = async ({ params }: { params: { workspaceId: string } }) => {
  if (!params.workspaceId) return;

  const response = (await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, params.workspaceId))
    .limit(1)) as workspace[];

  return (
    <div className="relative ">
      <QuillEditor
        defaultValue={response[0]?.data}
        dirType="workspace"
        fileId={params.workspaceId}
        icon={response[0]?.iconId}
      ></QuillEditor>
    </div>
  );
};

export default Workspace;
