import React from 'react';
import { ModeToggle } from '../modeToggle';
import Avatar from '../../../public/avatars/4.png';
import Image from 'next/image';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import db from '@/lib/supabase/db';
import { profiles } from '../../../migrations/schema';
import { eq } from 'drizzle-orm';
import LogoutButton from '../logoutButton';
import { LogOut } from 'lucide-react';
const UserCard = async () => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const profile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user?.id));

  return (
    <article className="cursor-pointer flex justify-between items-center px-4 py-2 dark:bg-Neutrals-12 rounded-3xl">
      <aside className="flex justify-center items-center gap-2">
        <Image
          src={Avatar}
          alt="avatar logo"
          className="rounded-full w-6 h-6"
        />
        <div className="flex flex-col">
          <span className="text-muted-foreground">Free Plan</span>
          <small className="w-[100px] overflow-hidden overflow-ellipsis">
            {profile[0].email}
          </small>
        </div>
      </aside>
      <div className="flex items-center justify-center">
        <LogoutButton>
          <LogOut />
        </LogoutButton>
        <ModeToggle />
      </div>
    </article>
  );
};

export default UserCard;
