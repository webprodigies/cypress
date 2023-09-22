'use client';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CollaboratedWorkspaces,
  PrivateWorkspaces,
  SharedWorkspaces,
} from '@/lib/supabase/supabase.types';
import { Separator } from './ui/separator';
import Image from 'next/image';
import Logo from '../../public/cypresslogo.svg';
import { Button } from './ui/button';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMemo } from 'react';

interface WorkspaceSelectProps {
  privateWorkspaces: PrivateWorkspaces;
  sharedWorkspaces: SharedWorkspaces;
  collaboratingWorkspaces: CollaboratedWorkspaces;
}
const WorkspaceSelect: React.FC<WorkspaceSelectProps> = ({
  privateWorkspaces,
  sharedWorkspaces,
  collaboratingWorkspaces,
}) => {
  const params = useParams();
  const def = useMemo(() => String(params.workspaceId || 'Cypress'), []);
  const router = useRouter();
  return (
    <article className="flex justify-center items-center gap-2 mb-4">
      <Image
        src={Logo}
        alt="Workspace Logo"
        width={42}
        height={42}
      />
      <Select
        onValueChange={(value) => router.push(`/dashboard/${value}`)}
        defaultValue={def}
      >
        <SelectTrigger className="w-full h-12 border-none">
          <div className="text-white w-[170px] overflow-hidden overflow-ellipsis whitespace-nowrap text-lg text-left ">
            <span className="">
              <SelectValue placeholder="Workspace" />
            </span>
          </div>
        </SelectTrigger>
        <SelectContent className="h-[190px] group overflow-scroll p-2">
          <SelectGroup className="">
            <SelectItem
              className="group-data-[state=open]:hidden"
              value="Cypress"
            >
              Cypress
            </SelectItem>
            <SelectLabel className="text-muted-foreground pl-0">
              Private
            </SelectLabel>

            {privateWorkspaces.map((privateWorkspace) => (
              <div
                key={privateWorkspace.id}
                className="flex flex-row-reverse justify-center items-center my-2 rounded-lg overflow-clip"
              >
                <SelectItem
                  key={privateWorkspace.id}
                  value={privateWorkspace.id}
                  className="text-left pl-2 peer data-[state=checked]:bg-muted/40 rounded-none "
                >
                  <p className="text-lg w-[170px] overflow-hidden overflow-ellipsis whitespace-nowrap">
                    {privateWorkspace.title}
                  </p>
                  <p className="text-xs text-muted-foreground">Private</p>
                </SelectItem>
                <div className="peer-hover:bg-muted/40 peer-data-[state=checked]:bg-muted/40 relative  h-[56px] w-[40px]">
                  <Image
                    src={Logo}
                    alt="Workspace Logo"
                    fill
                  />
                </div>
              </div>
            ))}

            <Separator className="my-2" />
            <SelectLabel className="text-muted-foreground pl-0">
              Shared
            </SelectLabel>
            {sharedWorkspaces.map((sharedWorkspace) => (
              <div
                key={sharedWorkspace.id}
                className="flex flex-row-reverse justify-center items-center my-2 rounded-lg overflow-clip"
              >
                <SelectItem
                  key={sharedWorkspace.id}
                  value={sharedWorkspace.id}
                  className="text-left pl-2 peer data-[state=checked]:bg-muted/40  rounded-none "
                >
                  <p className="text-lg w-[170px] overflow-hidden overflow-ellipsis whitespace-nowrap">
                    {sharedWorkspace.title}
                  </p>
                  <p className="text-xs text-muted-foreground">100 Members</p>
                </SelectItem>
                <div className="peer-hover:bg-muted/40 peer-data-[state=checked]:bg-muted/40 relative  h-[56px] w-[40px]">
                  <Image
                    src={Logo}
                    alt="Workspace Logo"
                    fill
                  />
                </div>
              </div>
            ))}

            <Separator className="my-2" />
            <SelectLabel className="text-muted-foreground pl-0">
              Collaborating
            </SelectLabel>
            {collaboratingWorkspaces.map((collaboratedWorkspace) => (
              <div
                key={collaboratedWorkspace.id}
                className="flex flex-row-reverse justify-center items-center my-2 rounded-lg overflow-clip"
              >
                <SelectItem
                  key={collaboratedWorkspace.id}
                  value={collaboratedWorkspace.id}
                  className="text-left pl-2 peer data-[state=checked]:bg-muted/40  rounded-none "
                >
                  <p className="text-lg w-[170px] overflow-hidden overflow-ellipsis whitespace-nowrap">
                    {collaboratedWorkspace.title}
                  </p>
                  <p className="text-xs text-muted-foreground">100 Members</p>
                </SelectItem>
                <div className="peer-hover:bg-muted/40 peer-data-[state=checked]:bg-muted/40 relative  h-[56px] w-[40px]">
                  <Image
                    src={Logo}
                    alt="Workspace Logo"
                    fill
                  />
                </div>
              </div>
            ))}
          </SelectGroup>
          <Separator className="my-2" />
          <Button
            variant="ghost"
            className="w-full gap-2 "
          >
            <article className="text-slate-500 rounded-full bg-slate-800 w-4 h-4 flex items-center justify-center">
              +
            </article>
            Create workspace
          </Button>
        </SelectContent>
      </Select>
    </article>
  );
};

export default WorkspaceSelect;
