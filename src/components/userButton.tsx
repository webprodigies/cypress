import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { CreditCard, LogOutIcon, PanelRightOpen, Settings } from 'lucide-react';
import { cookies } from 'next/headers';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModeToggle } from './modeToggle';
import LogoutButton from './logoutButton';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function UserButton() {
  const supabase = createServerComponentClient({ cookies });
  const user = await supabase.auth.getUser();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={'ghost'}
          className="dark:text-white w-full justify-start h-14 p-2"
        >
          <article className="flex justify-between w-full items-center">
            <div className="flex gap-4 items-center">
              <Avatar className="w-6 h-6">
                <AvatarImage src={`/avatars/2.png`} />
                <AvatarFallback>PJ</AvatarFallback>
              </Avatar>
              <span className="w-[135px] overflow-hidden overflow-ellipsis">
                {user.data.user?.email}
              </span>
            </div>
          </article>
          <PanelRightOpen
            size={20}
            className="text-foreground"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="">
        <DropdownMenuGroup className="px-2 flex gap-4 justify-between items-center">
          <div className="flex flex-col">
            <span className="overflow-hidden overflow-ellipsis w-40">
              {user?.data?.user?.email}
            </span>
            <span className="text-neutral-500 text-sm">Free Plan</span>
          </div>
          <DropdownMenuItem className="p-0">
            <ModeToggle />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator></DropdownMenuSeparator>
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Subscription</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <LogOutIcon className="mr-2 h-4 w-4" />
            <LogoutButton>Logout</LogoutButton>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
