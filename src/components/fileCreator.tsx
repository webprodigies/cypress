'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AuthUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Check, Lock, SearchIcon, Share } from 'lucide-react';

import {
  createFile,
  createFolder,
  createPrivateWorkspace,
} from '@/lib/supabase/queries';
import { AddWorkspaceCollaborator } from '@/lib/supabase/supabase.types';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import EmojiPicker from './emoji-picker';
import { v4 as uuid } from 'uuid';
import { useToast } from './ui/use-toast';

interface FileCreatorProps {
  type?: 'workspace' | 'folder' | 'file';
  parent: string;
  getNewValue?: (newValue: {
    id: string;
    title: string;
    iconId: string;
  }) => void;
}

/*
New & Edit
type workspace, folder and file
*/
const FileCreator: React.FC<FileCreatorProps> = ({
  type,
  parent,
  getNewValue,
}) => {
  const { toast } = useToast();
  const [permission, setPermissions] = useState<string>('private');
  const [title, setTitle] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState('T');
  const [collaborators, setCollaborators] = useState<
    AddWorkspaceCollaborator[]
  >([]);
  const [user, setUser] = useState<AuthUser>();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const addCollaborator = () => {
    setCollaborators([
      ...collaborators,
      { userId: '1234123-5123nl1jk2h314-231234o182ui', workspaceId: 'asd' },
    ]);
  };

  const createItem = async () => {
    if (!parent || !selectedIcon) return;
    const uniqueId = uuid();

    if (getNewValue)
      getNewValue({
        id: uniqueId,
        title,
        iconId: selectedIcon,
      });

    if (user?.id) {
      if (type === 'workspace') {
        if (permission === 'private') {
          const res = await createPrivateWorkspace({
            workspaceOwner: user.id,
            title: title,
            iconId: '✨',
          });
          router.refresh();
        }
      } else if (type === 'folder') {
        await createFolder(parent, title, selectedIcon);
        router.refresh();
      } else if (type === 'file') {
        await createFile(parent, title, uniqueId, selectedIcon);
      }
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
  }, [supabase]);

  const iconSelectHandler = (icon: string) => {
    setSelectedIcon(icon);
  };

  return (
    <div className="flex gap-4 flex-col">
      <div className="">
        <label
          htmlFor="name"
          className="text-sm text-muted-foreground"
        >
          Icon & Name
        </label>
        <div className="flex justify-center items-center gap-2">
          <EmojiPicker
            type={'native'}
            getValue={iconSelectHandler}
          >
            <div className="h-8 w-8 bg-muted flex justify-center items-center p-2 rounded-lg">
              {selectedIcon}
            </div>
          </EmojiPicker>
          <Input
            name="name"
            value={title}
            className=" h-2 bg-white dark:bg-background"
            placeholder={`${type} Name`}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      {type === 'workspace' && (
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
            <SelectTrigger className="w-full h-full -mt-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup defaultValue={'blueberry'}>
                <SelectItem value="private">
                  <div className="p-2 flex gap-4 justify-center items-center">
                    <Lock></Lock>
                    <article className="text-left flex flex-col">
                      <span>Private</span>
                      <span>
                        Your workspace is private to you. You can choose to
                        share it later.
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
      )}
      {permission === 'shared' && (
        <div>
          <label
            htmlFor="collaborator"
            className="text-sm text-muted-foreground"
          >
            Add collaborators
          </label>
          <div className="flex justify-center items-center gap-2">
            <SearchIcon />
            <Input
              name="name"
              className=" h-2 bg-white dark:bg-background"
              placeholder="Collaborator Email"
            />
          </div>
          <div className="mt-4 ">
            <span className="text-sm text-muted-foreground ">
              Results {collaborators.length || ''}
            </span>
            <ScrollArea className="max-h-[200px] overflow-y-scroll w-full rounded-md border border-muted-foreground/20">
              <div
                id="result"
                className="p-4 flex justify-between items-center"
              >
                <div className="flex gap-4 items-center">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={`/avatars/7.png`} />
                    <AvatarFallback>PJ</AvatarFallback>
                  </Avatar>
                  <div className="text-sm flex justify-center items-center gap-2 text-muted-foreground">
                    perrinjoseph1998@gmail.com
                  </div>
                </div>
                <Button
                  onClick={addCollaborator}
                  variant="secondary"
                >
                  Add
                </Button>
              </div>
              {collaborators.map((collaborator) => (
                <div
                  id="result"
                  className="p-4 flex justify-between items-center"
                  key={collaborator.userId}
                >
                  <div className="flex gap-4 items-center">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={`/avatars/7.png`} />
                      <AvatarFallback>PJ</AvatarFallback>
                    </Avatar>
                    <div className="text-sm flex justify-center items-center gap-2 text-muted-foreground">
                      perrinjoseph1998@gmail.com
                    </div>
                  </div>
                  <Button
                    onClick={addCollaborator}
                    variant="secondary"
                  >
                    Add
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
      )}
      <Button
        type="submit"
        disabled={
          !title ||
          selectedIcon === 'T' ||
          (permission === 'shared' && collaborators.length === 0)
        }
        variant={'secondary'}
        onClick={createItem}
      >
        Create
      </Button>
    </div>
  );
};

export default FileCreator;
