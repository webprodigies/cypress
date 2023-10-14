export const dynamic = 'force-dynamic';

import db from '@/lib/supabase/db';
import React from 'react';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import { DashboardSetup } from '@/components/dashboard-setup/dashboard-setup';
import { getUserSubscriptionStatus } from '@/lib/supabase/queries';

const Dashboard = async () => {
  // Initialize a Supabase client using server-side cookies
  const supabase = createServerComponentClient({ cookies });

  // Fetch user data to determine if the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If there's no authenticated user, exit the component
  if (!user) return;

  // Query the database to find the workspace owned by the user
  const workspace = await db.query.workspaces.findFirst({
    where: (workspace, { eq }) => eq(workspace.workspaceOwner, user.id),
  });

  // Retrieve the user's subscription status
  const { data: subscription, error: subscriptionError } =
    await getUserSubscriptionStatus(user.id);

  // If there is an error in fetching the subscription status, exit the component
  if (subscriptionError) return;

  // If the user doesn't have a workspace, render the DashboardSetup component
  if (!workspace)
    return (
      <div className="bg-background h-screen w-screen flex justify-center items-center">
        <DashboardSetup
          user={user}
          subscription={subscription}
        />
      </div>
    );

  // Redirect the user to their dashboard since they have a workspace
  redirect(`/dashboard/${workspace.id}`);
};

export default Dashboard;
