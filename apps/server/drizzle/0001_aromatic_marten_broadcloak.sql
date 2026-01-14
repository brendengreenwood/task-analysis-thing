CREATE TABLE `beliefs` (
	`id` text PRIMARY KEY NOT NULL,
	`mental_model_id` text NOT NULL,
	`content` text NOT NULL,
	`reality` text,
	`is_mismatch` integer DEFAULT false,
	`severity` text,
	`insight_ids` text DEFAULT '[]',
	FOREIGN KEY (`mental_model_id`) REFERENCES `mental_models`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `concept_relationships` (
	`id` text PRIMARY KEY NOT NULL,
	`mental_model_id` text NOT NULL,
	`from_concept_id` text NOT NULL,
	`to_concept_id` text NOT NULL,
	`relationship_type` text,
	`label` text,
	FOREIGN KEY (`mental_model_id`) REFERENCES `mental_models`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_concept_id`) REFERENCES `concepts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_concept_id`) REFERENCES `concepts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `concepts` (
	`id` text PRIMARY KEY NOT NULL,
	`mental_model_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`user_language` text,
	`system_equivalent` text,
	`x` integer DEFAULT 0 NOT NULL,
	`y` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`mental_model_id`) REFERENCES `mental_models`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `mental_models` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`persona_id` text,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`persona_id`) REFERENCES `personas`(`id`) ON UPDATE no action ON DELETE set null
);
