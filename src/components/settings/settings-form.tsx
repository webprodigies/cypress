'use client';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Profile, workspace } from '@/lib/supabase/supabase.types';
import { AuthUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Briefcase,
  CreditCard,
  ExternalLink,
  Lock,
  LogOut,
  Plus,
  Share,
  User,
} from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import CollaboratorSearch from '../collaborator-search';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { v4 } from 'uuid';
import Link from 'next/link';
import { useAppState } from '@/lib/providers/state-provider';
import {
  addCollaborators,
  deleteWorkspace,
  findProfile,
  getCollaborators,
  removeCollaborators,
  updateProfile,
  updateWorkspace,
} from '@/lib/supabase/queries';
import CypressProfileIcon from '../icons/cypressProfileIcon';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useToast } from '../ui/use-toast';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import LogoutButton from '../logoutButton';
import { postData } from '@/lib/util/helpers';

const SettingsForm = () => {
  const { setOpen, subscription } = useSubscriptionModal();

  const { toast } = useToast();
  const { state, workspaceId, dispatch } = useAppState();
  const [permission, setPermissions] = useState<string>('Private');
  const [collaborators, setCollaborators] = useState<Profile[] | []>([]);
  const [user, setUser] = useState<Profile | undefined>(undefined);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [openAlertMessage, setOpenAlertMessage] = useState(false);
  const [workspaceDetails, setWorkspaceDetails] = useState<workspace>();
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const addCollaborator = async (profile: Profile) => {
    if (!workspaceId) return;
    if (subscription?.status !== 'active' && collaborators.length >= 2) {
      setOpen(true);
      return;
    }
    await addCollaborators([profile], workspaceId);
    setCollaborators([...collaborators, profile]);
    //to refresh our workspace categories
    router.refresh();
  };

  //Delete a collaborator
  const removeCollaborator = async (profile: Profile) => {
    if (!workspaceId) return;
    if (collaborators.length === 1) {
      setPermissions('Private');
    }
    await removeCollaborators([profile], workspaceId);
    setCollaborators(
      collaborators.filter((collaborator) => collaborator.id !== profile.id)
    );
    router.refresh();
  };

  //Save the changes for the input field
  const workspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId || !e.target.value) return;
    dispatch({
      type: 'UPDATE_WORKSPACE_DATA',
      payload: { workspace: { title: e.target.value }, workspaceId },
    });
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(async () => {
      await updateWorkspace({ title: e.target.value }, workspaceId);
    }, 500);
  };

  //Dont change the value until the User confirms
  const onPermissionsChange = (val: string) => {
    if (val === 'Private') {
      setOpenAlertMessage(true);
    } else setPermissions(val);
  };

  const onChangeworkspaceLogo = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!workspaceId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const uuid = v4();
    setUploadingLogo(true);
    const { data, error } = await supabase.storage
      .from('workspace-logos')
      .upload(`workspaceLogo.${workspaceId}.${uuid}`, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (!error) {
      dispatch({
        type: 'UPDATE_WORKSPACE_DATA',
        payload: { workspace: { logo: data.path }, workspaceId },
      });
      await updateWorkspace({ logo: data.path }, workspaceId);
      setUploadingLogo(false);
    }
  };

  //When the user confirmed they want to change shared to private then we remove everyone.
  const onClickAlertConfirm = async () => {
    if (!workspaceId) return;
    if (collaborators.length > 0) {
      await removeCollaborators(collaborators, workspaceId);
    }
    setPermissions('Private');
    setOpenAlertMessage(false);
  };

  //User can change profile picture.
  const onChangeProfilePicture = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProfilePic(true);
    const uuid = v4();
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(`avatar.${user.id}.${uuid}`, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (!error) {
      await updateProfile({ avatarUrl: data.path }, user.id);
      setUploadingProfilePic(false);
      setUser({
        ...user,
        avatarUrl: supabase.storage.from('avatars').getPublicUrl(data.path)
          ?.data.publicUrl,
      });
      router.refresh();
    }
  };

  //Fetching user details so we can show the avatar in the settings tav
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const userInfo = await findProfile(user.id);
        const avatarUrl = userInfo?.avatarUrl
          ? supabase.storage.from('avatars').getPublicUrl(userInfo.avatarUrl)
              ?.data.publicUrl
          : null;
        if (userInfo) setUser({ ...userInfo, avatarUrl });
      }
    };
    getUser();
  }, [supabase]);

  //Get workspaceDetails
  useEffect(() => {
    const showingWorkspace = state.workspaces.find(
      (workspace) => workspace.id === workspaceId
    );
    if (showingWorkspace) {
      setWorkspaceDetails(showingWorkspace);
    }
  }, [workspaceId, state]);

  //Get all collaborators
  useEffect(() => {
    if (!workspaceId) return;
    const fetchCollaborators = async () => {
      const response = await getCollaborators(workspaceId);
      if (response.length) {
        setPermissions('Shared');
        setCollaborators(response);
      }
    };
    fetchCollaborators();
  }, [workspaceId]);

  //Create the stipe portal to manage subscription
  const redirectToCustomerPortal = async () => {
    setLoadingPortal(true);
    try {
      const { url, error } = await postData({
        url: '/api/create-portal-link',
      });
      window.location.assign(url);
    } catch (error) {
      if (error) console.log(error);
    }
    setLoadingPortal(false);
  };

  return (
    <div className="flex gap-4 flex-col">
      <p className="flex items-center gap-2 mt-6">
        <Briefcase size={20} />
        Workspace
      </p>
      <Separator />
      <div className="flex flex-col gap-2">
        <label
          htmlFor="workspaceName"
          className="text-sm text-muted-foreground"
        >
          Name
        </label>
        <Input
          name="workspaceName"
          value={workspaceDetails ? workspaceDetails.title : ''}
          className=" h-2 bg-background"
          placeholder="Workspace Name"
          onChange={(e) => workspaceNameChange(e)}
        />

        <label
          htmlFor="workspaceLogo"
          className="text-sm text-muted-foreground"
        >
          Workspace Logo
        </label>

        <Input
          name="workspaceLogo"
          type="file"
          accept="image/*"
          className="bg-background"
          placeholder="Workspace Logo"
          onChange={onChangeworkspaceLogo}
          disabled={uploadingLogo || subscription?.status !== 'active'}
        />
        {subscription?.status !== 'active' && (
          <small className="text-muted-foreground">
            To customize your workspace, you need to be on a Pro Plan
          </small>
        )}
      </div>
      <>
        <label
          htmlFor="name"
          className="text-sm text-muted-foreground"
        >
          Permissions
        </label>

        <Select
          onValueChange={onPermissionsChange}
          value={permission}
        >
          <SelectTrigger className="w-full h-26 -mt-3">
            <SelectValue>
              <div className="p-2 flex gap-4 justify-center items-center">
                {permission === 'Private' ? <Lock></Lock> : <Share></Share>}
                <article className="text-left flex flex-col">
                  <span>{permission}</span>
                  <span>
                    {permission === 'Private'
                      ? 'Your workspace is private to you. You can choose to share it later.'
                      : 'You can invite collaborators.'}
                  </span>
                </article>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Private">
                <div className="p-2 flex gap-4 justify-center items-center">
                  <Lock></Lock>
                  <article className="text-left flex flex-col">
                    <span>Private</span>
                    <span>
                      Your workspace is Private to you. You can choose to share
                      it later.
                    </span>
                  </article>
                </div>
              </SelectItem>
              <SelectItem value="Shared">
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
      {permission === 'Shared' && (
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

      <Alert variant="destructive">
        <AlertDescription>
          Warning! deleting you workspace will permanantly delete all data
          related to this workspace.
        </AlertDescription>
        <Button
          type="submit"
          size="sm"
          variant={'destructive'}
          className="mt-4 text-sm bg-destructive/40 border-2 border-destructive"
          onClick={async () => {
            if (workspaceId) await deleteWorkspace(workspaceId);
            toast({
              title: 'Successfully deleted your workspae',
            });
            router.replace('/dashboard');
          }}
        >
          Delete Workspace
        </Button>
      </Alert>

      <p className="flex items-center gap-2  mt-6">
        <User size={20} /> Profile
      </p>
      <Separator />
      <div className="flex items-center">
        <Avatar className="w-16 h-16 rounded-none">
          <AvatarImage src={user?.avatarUrl || ''} />
          <AvatarFallback>
            <CypressProfileIcon />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col ml-6">
          <small className="text-muted-foreground cursor-not-allowed">
            {user ? user.email : ''}
          </small>
          <label
            htmlFor="profilePicture"
            className="text-sm text-muted-foreground"
          >
            Profile Picture
          </label>
          <Input
            name="profilePicture"
            type="file"
            accept="image/*"
            className="bg-background"
            placeholder="Workspace Name"
            onChange={onChangeProfilePicture}
            disabled={uploadingProfilePic}
          />
        </div>
      </div>

      <LogoutButton>
        <div className="flex items-center ">
          <LogOut />
        </div>
      </LogoutButton>
      <p className="flex items-center gap-2 mt-6">
        <CreditCard size={20} /> Billing & Plan
      </p>
      <Separator />
      <p className="text-muted-foreground">
        You are currently on a{' '}
        {subscription?.status === 'active' ? 'Pro' : 'Free'} Plan
      </p>
      <Link
        href="/"
        target="_blank"
        className="text-muted-foreground flex flex-row items-center gap-2"
      >
        View Plans <ExternalLink size={16} />
      </Link>
      {subscription?.status === 'active' ? (
        <div>
          <Button
            type="button"
            size="sm"
            variant={'secondary'}
            disabled={loadingPortal}
            className="text-sm"
            onClick={redirectToCustomerPortal}
          >
            Manage Subscription
          </Button>
        </div>
      ) : (
        <div>
          <Button
            type="button"
            size="sm"
            variant={'secondary'}
            className="text-sm"
            onClick={() => {
              setOpen(true);
            }}
          >
            Start Plan
          </Button>
        </div>
      )}

      <AlertDialog open={openAlertMessage}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Changing a Shared workspace to a Private workspace will remove all
              collaborators permanantly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setOpenAlertMessage(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onClickAlertConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsForm;
