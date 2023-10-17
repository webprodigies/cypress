'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AuthUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Lock, Plus, SearchIcon, Share } from 'lucide-react';

import { addCollaborators, createWorkspace } from '@/lib/supabase/queries';
import {
  AddWorkspaceCollaborator,
  Profile,
  workspace,
} from '@/lib/supabase/supabase.types';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { v4 as uuid } from 'uuid';
import { useToast } from '../ui/use-toast';
import CollaboratorSearch from '../collaborator-search';

interface WorkspaceCreatorProps {}

/*
New & Edit
type workspace, folder and file
*/

const WorkspaceCreator: React.FC<WorkspaceCreatorProps> = () => {
  const [permission, setPermissions] = useState<string>('private');
  const [title, setTitle] = useState<string>('');
  const [collaborators, setCollaborators] = useState<Profile[]>([]);
  const [user, setUser] = useState<AuthUser>();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const addCollaborator = (profile: Profile) => {
    setCollaborators([...collaborators, profile]);
  };

  const removeCollaborator = (profile: Profile) => {
    setCollaborators(
      collaborators.filter((collaborator) => collaborator.id !== profile.id)
    );
  };

  const createItem = async () => {
    const uniqueId = uuid();
    if (user?.id) {
      const newWorkspace: workspace = {
        data: null,
        createdAt: new Date().toISOString(),
        iconId: '💼',
        id: uniqueId,
        inTrash: '',
        title,
        workspaceOwner: user.id,
        logo: null,
      };
      if (permission === 'private') {
        await createWorkspace(newWorkspace);
        router.refresh();
      }
      if (permission === 'shared') {
        await createWorkspace(newWorkspace);
        await addCollaborators(collaborators, uniqueId);
        router.refresh();
      }
      router.refresh();
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUser(user);
    };
    getUser();
  }, []);

  return (
    <div className="flex gap-4 flex-col">
      <div className="">
        <label
          htmlFor="name"
          className="text-sm text-muted-foreground"
        >
          Name
        </label>
        <div className="flex justify-center items-center gap-2">
          <Input
            name="name"
            value={title}
            className=" h-2 bg-white dark:bg-background"
            placeholder="Workspace Name"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      <>
        <label
          htmlFor="name"
          className="text-sm text-muted-foreground"
        >
          Permissions
        </label>

        <Select
          onValueChange={(val) => {
            setPermissions(val);
          }}
          defaultValue={permission}
        >
          <SelectTrigger className="w-full h-26 -mt-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="private">
                <div className="p-2 flex gap-4 justify-center items-center">
                  <Lock></Lock>
                  <article className="text-left flex flex-col">
                    <span>Private</span>
                    <span>
                      Your workspace is private to you. You can choose to share
                      it later.
                    </span>
                  </article>
                </div>
              </SelectItem>
              <SelectItem value="shared">
                <div className="p-2 flex gap-4 justify-center items-center">
                  <Share></Share>
                  <article className="text-left flex flex-col">
                    <span>Shared</span>
                    <span>You can invite collaborators.</span>
                  </article>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </>
      {permission === 'shared' && (
        <div>
          <CollaboratorSearch
            existingCollaborators={collaborators}
            getCollaborator={(profile) => {
              addCollaborator(profile);
            }}
          >
            <Button
              type="button"
              className="text-sm mt-4"
              variant={'secondary'}
            >
              <Plus />
              Add Collaborators
            </Button>
          </CollaboratorSearch>

          <div className="mt-4 ">
            <span className="text-sm text-muted-foreground ">
              Collaborators {collaborators.length || ''}
            </span>
            <ScrollArea className="h-[120px]  overflow-y-scroll w-full rounded-md border border-muted-foreground/20">
              {collaborators.length ? (
                collaborators.map((collaborator) => (
                  <div
                    id="result"
                    className="p-4 flex justify-between items-center"
                    key={collaborator.id}
                  >
                    <div className="flex gap-4 items-center">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`/avatars/7.png`} />
                        <AvatarFallback>PJ</AvatarFallback>
                      </Avatar>
                      <div className="text-sm gap-2 text-muted-foreground overflow-hidden overflow-ellipsis sm:w-[300px] w-[140px]">
                        {collaborator.email}
                      </div>
                    </div>
                    <Button
                      onClick={(e) => removeCollaborator(collaborator)}
                      variant="secondary"
                    >
                      Remove
                    </Button>
                  </div>
                ))
              ) : (
                <div className="absolute right-0 left-0 top-0 bottom-0 flex justify-center items-center">
                  <span className="text-muted-foreground text-sm">
                    You have no collaborators
                  </span>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}
      <Button
        type="submit"
        disabled={
          !title || (permission === 'shared' && collaborators.length === 0)
        }
        variant={'secondary'}
        onClick={createItem}
      >
        Create
      </Button>
    </div>
  );
};

export default WorkspaceCreator;
