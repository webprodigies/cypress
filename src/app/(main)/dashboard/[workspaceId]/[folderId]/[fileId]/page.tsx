export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import db from '@/lib/supabase/db';
import React from 'react';
import { files } from '../../../../../../../migrations/schema';
import { File } from '@/lib/supabase/supabase.types';
import { eq } from 'drizzle-orm';
import QuillEditor from '@/components/quillEditor/quill';

const File = async ({ params }: { params: { fileId: string } }) => {
  if (!params.fileId) return;

  const response = (await db
    .select()
    .from(files)
    .where(eq(files.id, params.fileId))
    .limit(1)) as File[];

  return (
    <div className="relative ">
      <QuillEditor
        defaultValue={response[0]?.data}
        dirType="file"
        fileId={params.fileId}
        icon={response[0]?.iconId}
      ></QuillEditor>
    </div>
  );
};

export default File;
