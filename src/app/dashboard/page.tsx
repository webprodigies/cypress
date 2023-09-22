import db from '@/lib/supabase/db';
import { workspaces } from '@/lib/supabase/schema';
import { eq } from 'drizzle-orm';
import React from 'react';

const Dashboard = async ({ params }: { params: { workspaceId: string } }) => {
  console.log('PARAMS', params);
  return (
    <div className="overflow-scroll h-screen">
      Viewing Dashboard.<br></br>
    </div>
  );
};

export default Dashboard;
