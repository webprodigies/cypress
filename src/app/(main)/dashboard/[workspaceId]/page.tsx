export const dynamic = 'force-dynamic';

import db from '@/lib/supabase/db';
import React from 'react';
import { workspaces } from '../../../../../migrations/schema';
import { eq } from 'drizzle-orm';
import { workspace } from '@/lib/supabase/supabase.types';
import QuillEditor from '@/components/quillEditor/quill';

const Workspace = async ({ params }: { params: { workspaceId: string } }) => {
  const response = (await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, params.workspaceId))
    .limit(1)) as workspace[];


  return (
    <div className="relative ">
      <QuillEditor
        dirType="workspace"
        fileId={params.workspaceId}
        dirDetails={response[0] || {}}
      ></QuillEditor>
    </div>
  );
};

export default Workspace;
