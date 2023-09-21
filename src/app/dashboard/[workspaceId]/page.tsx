import db from '@/lib/supabase/db';
import { workspaces } from '@/lib/supabase/schema';
import { eq } from 'drizzle-orm';
import React from 'react';

const Workspace = async ({ params }: { params: { workspaceId: string } }) => {
  const data = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, params.workspaceId));
  return (
    <div className="overflow-scroll h-screen">
      Viewing Workspace.<br></br>
      {JSON.stringify(data)}
    </div>
  );
};

export default Workspace;
