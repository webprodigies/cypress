import Editor from '@/components/editor/editor';
import db from '@/lib/supabase/db';
import React from 'react';
import { workspaces } from '../../../../../migrations/schema';
import { eq } from 'drizzle-orm';
import { fakeType, workspace } from '@/lib/supabase/supabase.types';

const Workspace = async ({ params }: { params: { workspaceId: string } }) => {
  if (!params.workspaceId) return;

  const response = (await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, params.workspaceId))
    .limit(1)) as fakeType[];

  return (
    <div>
      <Editor defaultData={response}></Editor>
    </div>
  );
};

export default Workspace;
