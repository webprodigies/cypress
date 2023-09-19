'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { Button } from './ui/button';

interface LogoutButtonProps {
  children: React.ReactNode;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login');
      } else {
        setUser(user);
      }
    };
    fetchUser();
  }, [supabase]);

  const logoutUser = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      onClick={logoutUser}
    >
      {children}
    </Button>
  );
};

export default LogoutButton;
