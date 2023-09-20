import {
  pgTable,
  foreignKey,
  pgEnum,
  uuid,
  timestamp,
  text,
  primaryKey,
} from 'drizzle-orm/pg-core';

import { sql } from 'drizzle-orm';
export const keyStatus = pgEnum('key_status', [
  'default',
  'valid',
  'invalid',
  'expired',
]);
export const keyType = pgEnum('key_type', [
  'aead-ietf',
  'aead-det',
  'hmacsha512',
  'hmacsha256',
  'auth',
  'shorthash',
  'generichash',
  'kdf',
  'secretbox',
  'secretstream',
  'stream_xchacha20',
]);
export const aalLevel = pgEnum('aal_level', ['aal1', 'aal2', 'aal3']);
export const codeChallengeMethod = pgEnum('code_challenge_method', [
  's256',
  'plain',
]);
export const factorStatus = pgEnum('factor_status', ['unverified', 'verified']);
export const factorType = pgEnum('factor_type', ['totp', 'webauthn']);

export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  workspaceOwner: uuid('workspace_owner')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  iconId: text('icon_id').notNull(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  website: text('website'),
  email: text('email'),
});

export const folders = pgTable('folders', {
  folderId: uuid('folder_id').defaultRandom().primaryKey().notNull(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  title: text('title').notNull(),
  iconId: text('icon_id').notNull(),
});

export const collaborators = pgTable(
  'collaborators',
  {
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
  },
  (table) => {
    return {
      collaboratorsUserIdWorkspaceId: primaryKey(
        table.workspaceId,
        table.userId
      ),
    };
  }
);