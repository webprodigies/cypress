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

  console.log(response);

  return (
    <div className="relative ">
      <QuillEditor
        defaultValue={response[0]?.data}
        dirType="workspace"
        fileId={params.workspaceId}
        icon={response[0]?.iconId}
        title={response[0].title}
      ></QuillEditor>
    </div>
  );
};

export default Workspace;
