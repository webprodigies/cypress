export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import QuillEditor from '@/components/quillEditor/quill';
import db from '@/lib/supabase/db';
import { folders } from '@/lib/supabase/schema';
import { Folder } from '@/lib/supabase/supabase.types';
import { eq } from 'drizzle-orm';
import React from 'react';

const Folder = async ({ params }: { params: { folderId: string } }) => {
  const response = (await db
    .select()
    .from(folders)
    .where(eq(folders.folderId, params.folderId))
    .limit(1)) as Folder[];
  console.log(response);

  return (
    <div className="relative ">
      <QuillEditor
        defaultValue={response[0]?.data}
        dirType="folder"
        fileId={params.folderId}
        icon={response[0]?.iconId}
      ></QuillEditor>
    </div>
  );
};

export default Folder;
