import React from 'react';
import { ModeToggle } from '../modeToggle';
import Image from 'next/image';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import db from '@/lib/supabase/db';
import { profiles } from '../../../migrations/schema';
import { eq } from 'drizzle-orm';
import LogoutButton from '../logoutButton';
import { LogOut } from 'lucide-react';
import { AvatarFallback, AvatarImage, Avatar } from '../ui/avatar';
import CypressProfileIcon from '../icons/cypressProfileIcon';
const UserCard = async () => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const response = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.id, user.id),
  });
  let avatarPath;
  if (!response) return;
  if (!response.avatarUrl) avatarPath = '';
  else {
    avatarPath = supabase.storage
      .from('avatars')
      .getPublicUrl(response.avatarUrl)?.data.publicUrl;
  }

  const profile = {
    ...response,
    avatarUrl: avatarPath,
  };

  return (
    <article className="hidden sm:flex cursor-pointer justify-between items-center px-4 py-2 dark:bg-Neutrals-12 rounded-3xl">
      <aside className="flex justify-center items-center gap-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={profile.avatarUrl} />
          <AvatarFallback>
            <CypressProfileIcon />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <span className="text-muted-foreground">Free Plan</span>
          <small className="w-[100px] overflow-hidden overflow-ellipsis">
            {profile.email}
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
