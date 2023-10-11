'use client';
import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AuthUser } from '@supabase/supabase-js';
import { getProfiles } from '@/lib/supabase/queries';
import { Profile } from '@/lib/supabase/supabase.types';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

interface CollaboratorSearchProps {
  existingCollaborators: Profile[] | [];
  getCollaborator: (collaborator: Profile) => void;
  children: ReactNode;
}

const CollaboratorSearch: FC<CollaboratorSearchProps> = ({
  children,
  existingCollaborators,
  getCollaborator,
}) => {
  const [searchResults, setSearchResults] = useState<Profile[] | []>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<AuthUser>();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: res },
      } = await supabase.auth.getUser();
      if (res) setUser(res);
    };
    getUser();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [supabase]);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timerRef) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const res = await getProfiles(e.target.value, user?.email);
      console.log(res);
      setSearchResults(res);
    }, 450);
  };

  const addCollaborator = (profile: Profile) => {
    getCollaborator(profile);
  };

  return (
    <Sheet>
      <SheetTrigger className="w-full">{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Search Collaborators</SheetTitle>
          <SheetDescription>
            <label
              htmlFor="name"
              className="text-sm text-muted-foreground"
            >
              You can also remove collaborators after adding them from the
              settings tab.
            </label>
          </SheetDescription>
        </SheetHeader>
        <div className="flex justify-center items-center gap-2 mt-2">
          <Search />
          <Input
            name="name"
            className=" h-2 dark:bg-background"
            placeholder="Email"
            onChange={onChangeHandler}
          />
        </div>
        <ScrollArea className="mt-6 overflow-y-scroll w-full rounded-md ">
          {searchResults
            .filter(
              (result) =>
                !existingCollaborators.some(
                  (existing) => existing.id === result.id
                )
            )
            .filter((result) => result.id !== user?.id)
            .map((profile) => (
              <div
                id="result"
                className="p-4 flex justify-between items-center"
                key={profile.id}
              >
                <div className="flex gap-4 items-center">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={`/avatars/7.png`} />
                    <AvatarFallback>PJ</AvatarFallback>
                  </Avatar>
                  <div className="text-sm gap-2 overflow-hidden overflow-ellipsis w-[180px] text-muted-foreground">
                    {profile.email}
                  </div>
                </div>
                <Button
                  onClick={() => addCollaborator(profile)}
                  variant="secondary"
                >
                  Add
                </Button>
              </div>
            ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default CollaboratorSearch;
