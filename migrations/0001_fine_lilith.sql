ALTER TABLE "files" RENAME COLUMN "blocks" TO "data";--> statement-breakpoint
ALTER TABLE "folders" RENAME COLUMN "blocks" TO "data";--> statement-breakpoint
ALTER TABLE "workspaces" RENAME COLUMN "blocks" TO "data";--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "data" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "data" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "data" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "folders" ALTER COLUMN "data" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "folders" ALTER COLUMN "data" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "folders" ALTER COLUMN "data" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ALTER COLUMN "data" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "workspaces" ALTER COLUMN "data" DROP DEFAULT;