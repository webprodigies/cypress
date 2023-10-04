import { InferSelectModel } from 'drizzle-orm';
import {
  files,
  folders,
  profiles,
  workspaces,
} from '../../../migrations/schema';
import { ICON_NAMES } from '../constants';
import { OutputBlockData } from '@editorjs/editorjs';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      collaborators: {
        Row: {
          created_at: string;
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'collaborators_user_id_profiles_id_fk';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'collaborators_workspace_id_workspaces_id_fk';
            columns: ['workspace_id'];
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          }
        ];
      };
      files: {
        Row: {
          created_at: string;
          data: string | null;
          folder_id: string;
          icon_id: string;
          id: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          data?: string | null;
          folder_id: string;
          icon_id: string;
          id?: string;
          title: string;
        };
        Update: {
          created_at?: string;
          data?: string | null;
          folder_id?: string;
          icon_id?: string;
          id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'files_folder_id_folders_folder_id_fk';
            columns: ['folder_id'];
            referencedRelation: 'folders';
            referencedColumns: ['folder_id'];
          }
        ];
      };
      folders: {
        Row: {
          created_at: string;
          data: string | null;
          folder_id: string;
          icon_id: string;
          title: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string;
          data?: string | null;
          folder_id?: string;
          icon_id: string;
          title: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          data?: string | null;
          folder_id?: string;
          icon_id?: string;
          title?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'folders_workspace_id_workspaces_id_fk';
            columns: ['workspace_id'];
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          updated_at: string | null;
          website: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          created_at: string | null;
          data: string | null;
          icon_id: string;
          id: string;
          title: string;
          workspace_owner: string;
        };
        Insert: {
          created_at?: string | null;
          data?: string | null;
          icon_id: string;
          id?: string;
          title: string;
          workspace_owner: string;
        };
        Update: {
          created_at?: string | null;
          data?: string | null;
          icon_id?: string;
          id?: string;
          title?: string;
          workspace_owner?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'workspaces_workspace_owner_profiles_id_fk';
            columns: ['workspace_owner'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      aal_level: 'aal1' | 'aal2' | 'aal3';
      action: 'INSERT' | 'UPDATE' | 'DELETE' | 'TRUNCATE' | 'ERROR';
      code_challenge_method: 's256' | 'plain';
      equality_op: 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'in';
      factor_status: 'unverified' | 'verified';
      factor_type: 'totp' | 'webauthn';
      key_status: 'default' | 'valid' | 'invalid' | 'expired';
      key_type:
        | 'aead-ietf'
        | 'aead-det'
        | 'hmacsha512'
        | 'hmacsha256'
        | 'auth'
        | 'shorthash'
        | 'generichash'
        | 'kdf'
        | 'secretbox'
        | 'secretstream'
        | 'stream_xchacha20';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type CollaboratedWorkspace = {
  id: string; // The workspace's ID (assuming it's a string)
  createdAt: string; // The creation date in string format
  workspaceOwner: string; // The ID of the workspace owner (assuming it's a string)
  title: string; // The title of the workspace
  iconId: string; // The icon ID (assuming it's a number)
};

export type workspace = InferSelectModel<typeof workspaces>;
export type testType = workspace & { iconId: 'perrin' | 'something' };
export type profiles = InferSelectModel<typeof profiles>;
export type Folder = InferSelectModel<typeof folders>;
export type File = InferSelectModel<typeof files>;

export type WorkspacesWithIconIds = {
  [K in keyof workspace]: K extends 'iconId'
    ? (typeof ICON_NAMES)[number]
    : workspace[K];
};

export type CollaboratedWorkspaces = [WorkspacesWithIconIds];
export type PrivateWorkspaces = [WorkspacesWithIconIds];
export type SharedWorkspaces = [WorkspacesWithIconIds];
export type AddWorkspaceCollaborator = {
  userId: string;
  workspaceId: string;
};
