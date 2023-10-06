'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AuthUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Lock, SearchIcon, Share } from 'lucide-react';

import {
  createFolder,
  createPrivateWorkspace,
  updateEmojiFolder,
  updateTitleFile,
  updateTitleFolder,
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

interface FileEditorProps {
  type: 'workspace' | 'folder' | 'file';
  defaultIcon: string;
  defaultTitle: string;
  privacySettings?: string;
  parentId: string;
  getNewValue?: (newValue: { title: string; fileId: string }) => void;
}

const FileEditor: React.FC<FileEditorProps> = ({
  type,
  defaultIcon,
  defaultTitle,
  privacySettings,
  parentId,
  getNewValue,
}) => {
  const [permission, setPermissions] = useState<string>('private');
  const [title, setTitle] = useState<string>(defaultTitle);
  const [selectedIcon, setSelectedIcon] = useState(defaultIcon);
  const [collaborators, setCollaborators] = useState<
    AddWorkspaceCollaborator[]
  >([]);
  const [user, setUser] = useState<AuthUser>();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const addCollaborator = () => {
    setCollaborators([
      ...collaborators,
      { userId: '1234123-5123nl1jk2h314-231234o182ui', workspaceId: 'asd' },
    ]);
  };

  const updateItem = async () => {
    if (!parentId) return;
    if (user?.id) {
      if (type === 'workspace') {
        if (permission === 'private') {
          //Update the file
        }
      } else if (type === 'folder') {
        router.refresh();
      } else if (type === 'file') {
        router.refresh();
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

  const iconSelectHandler = async (icon: string) => {
    setSelectedIcon(icon);
    if (type === 'workspace') {
    }
    if (type === 'folder') {
      await updateEmojiFolder(parentId, icon);
      router.refresh();
    }
    if (type === 'file') {
    }
  };

  useEffect(() => {
    if (!title || title === defaultTitle) return;

    const update = async () => {
      if (type === 'folder') {
        await updateTitleFolder(parentId, title);
        router.refresh();
      } else if (type === 'file') {
        if (getNewValue) {
          getNewValue({ title, fileId: parentId.split('folder')[1] });
        }
        await updateTitleFile(parentId.split('folder')[1], title);
      }
    };

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(update, 350);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [title]);

  return (
    <div className="flex gap-4 flex-col">
      <div>
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
    </div>
  );
};

export default FileEditor;
