ALTER TABLE "files" ADD COLUMN "in_trash" text;--> statement-breakpoint
ALTER TABLE "folders" ADD COLUMN "in_trash" text;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "in_trash" text;