import { InferSelectModel } from 'drizzle-orm';
import {
  customers,
  files,
  folders,
  prices,
  products,
  profiles,
  subscriptions,
  workspaces,
} from '../../../migrations/schema';
import { OutputBlockData } from '@editorjs/editorjs';
import Stripe from 'stripe';

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
      customers: {
        Row: {
          id: string;
          stripe_customer_id: string | null;
        };
        Insert: {
          id: string;
          stripe_customer_id?: string | null;
        };
        Update: {
          id?: string;
          stripe_customer_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'customers_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
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
          in_trash: string | null;
          title: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string;
          data?: string | null;
          folder_id: string;
          icon_id: string;
          id?: string;
          in_trash?: string | null;
          title: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          data?: string | null;
          folder_id?: string;
          icon_id?: string;
          id?: string;
          in_trash?: string | null;
          title?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'files_folder_id_folders_folder_id_fk';
            columns: ['folder_id'];
            referencedRelation: 'folders';
            referencedColumns: ['folder_id'];
          },
          {
            foreignKeyName: 'files_workspace_id_workspaces_id_fk';
            columns: ['workspace_id'];
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          }
        ];
      };
      folders: {
        Row: {
          created_at: string;
          data: string | null;
          folder_id: string;
          icon_id: string;
          in_trash: string | null;
          title: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string;
          data?: string | null;
          folder_id?: string;
          icon_id: string;
          in_trash?: string | null;
          title: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          data?: string | null;
          folder_id?: string;
          icon_id?: string;
          in_trash?: string | null;
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
      prices: {
        Row: {
          active: boolean | null;
          currency: string | null;
          description: string | null;
          id: string;
          interval: Database['public']['Enums']['pricing_plan_interval'] | null;
          interval_count: number | null;
          metadata: Json | null;
          product_id: string | null;
          trial_period_days: number | null;
          type: Database['public']['Enums']['pricing_type'] | null;
          unit_amount: number | null;
        };
        Insert: {
          active?: boolean | null;
          currency?: string | null;
          description?: string | null;
          id: string;
          interval?:
            | Database['public']['Enums']['pricing_plan_interval']
            | null;
          interval_count?: number | null;
          metadata?: Json | null;
          product_id?: string | null;
          trial_period_days?: number | null;
          type?: Database['public']['Enums']['pricing_type'] | null;
          unit_amount?: number | null;
        };
        Update: {
          active?: boolean | null;
          currency?: string | null;
          description?: string | null;
          id?: string;
          interval?:
            | Database['public']['Enums']['pricing_plan_interval']
            | null;
          interval_count?: number | null;
          metadata?: Json | null;
          product_id?: string | null;
          trial_period_days?: number | null;
          type?: Database['public']['Enums']['pricing_type'] | null;
          unit_amount?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'prices_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prices_product_id_products_id_fk';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
      products: {
        Row: {
          active: boolean | null;
          description: string | null;
          id: string;
          image: string | null;
          metadata: Json | null;
          name: string | null;
        };
        Insert: {
          active?: boolean | null;
          description?: string | null;
          id: string;
          image?: string | null;
          metadata?: Json | null;
          name?: string | null;
        };
        Update: {
          active?: boolean | null;
          description?: string | null;
          id?: string;
          image?: string | null;
          metadata?: Json | null;
          name?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          billing_address: Json | null;
          email: string | null;
          full_name: string | null;
          id: string;
          payment_method: Json | null;
          updated_at: string | null;
          website: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          billing_address?: Json | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          payment_method?: Json | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          billing_address?: Json | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          payment_method?: Json | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          cancel_at: string | null;
          cancel_at_period_end: boolean | null;
          canceled_at: string | null;
          created: string;
          current_period_end: string;
          current_period_start: string;
          ended_at: string | null;
          id: string;
          metadata: Json | null;
          price_id: string | null;
          quantity: number | null;
          status: Database['public']['Enums']['subscription_status'] | null;
          trial_end: string | null;
          trial_start: string | null;
          user_id: string;
        };
        Insert: {
          cancel_at?: string | null;
          cancel_at_period_end?: boolean | null;
          canceled_at?: string | null;
          created?: string;
          current_period_end?: string;
          current_period_start?: string;
          ended_at?: string | null;
          id: string;
          metadata?: Json | null;
          price_id?: string | null;
          quantity?: number | null;
          status?: Database['public']['Enums']['subscription_status'] | null;
          trial_end?: string | null;
          trial_start?: string | null;
          user_id: string;
        };
        Update: {
          cancel_at?: string | null;
          cancel_at_period_end?: boolean | null;
          canceled_at?: string | null;
          created?: string;
          current_period_end?: string;
          current_period_start?: string;
          ended_at?: string | null;
          id?: string;
          metadata?: Json | null;
          price_id?: string | null;
          quantity?: number | null;
          status?: Database['public']['Enums']['subscription_status'] | null;
          trial_end?: string | null;
          trial_start?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_price_id_fkey';
            columns: ['price_id'];
            referencedRelation: 'prices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'subscriptions_price_id_prices_id_fk';
            columns: ['price_id'];
            referencedRelation: 'prices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'subscriptions_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      workspaces: {
        Row: {
          created_at: string | null;
          data: string | null;
          icon_id: string;
          id: string;
          in_trash: string | null;
          logo: string | null;
          title: string;
          workspace_owner: string;
        };
        Insert: {
          created_at?: string | null;
          data?: string | null;
          icon_id: string;
          id?: string;
          in_trash?: string | null;
          logo?: string | null;
          title: string;
          workspace_owner: string;
        };
        Update: {
          created_at?: string | null;
          data?: string | null;
          icon_id?: string;
          id?: string;
          in_trash?: string | null;
          logo?: string | null;
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
      pricing_plan_interval: 'day' | 'week' | 'month' | 'year';
      pricing_type: 'one_time' | 'recurring';
      subscription_status:
        | 'trialing'
        | 'active'
        | 'canceled'
        | 'incomplete'
        | 'incomplete_expired'
        | 'past_due'
        | 'unpaid';
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
export type Profile = InferSelectModel<typeof profiles>;
export type Folder = InferSelectModel<typeof folders>;
export type File = InferSelectModel<typeof files>;
export type Product = InferSelectModel<typeof products>;
export type Price = InferSelectModel<typeof prices> & { products?: Product };
export type Customer = InferSelectModel<typeof customers>;
export type Subscription = InferSelectModel<typeof subscriptions> & {
  prices: Price;
};

export type ProductWithPrice = Product & {
  prices?: Price[];
};

export type AddWorkspaceCollaborator = {
  userId: string;
};
