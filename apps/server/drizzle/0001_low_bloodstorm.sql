ALTER TABLE `personas` ADD `avatar_url` text;--> statement-breakpoint
ALTER TABLE `personas` ADD `skills` text DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `personas` ADD `environment` text;--> statement-breakpoint
ALTER TABLE `personas` ADD `experience_level` text;--> statement-breakpoint
ALTER TABLE `personas` ADD `usage_frequency` text;--> statement-breakpoint
ALTER TABLE `personas` ADD `influence` text;--> statement-breakpoint
ALTER TABLE `personas` ADD `created_at` integer NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `personas` ADD `updated_at` integer NOT NULL DEFAULT 0;