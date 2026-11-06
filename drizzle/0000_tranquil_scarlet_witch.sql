CREATE TABLE `availability_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`start_at` integer NOT NULL,
	`end_at` integer NOT NULL,
	`reason` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `blocks_listing_idx` ON `availability_blocks` (`listing_id`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`host_id` text NOT NULL,
	`listing_title` text NOT NULL,
	`city` text NOT NULL,
	`guest_name` text NOT NULL,
	`guest_email` text NOT NULL,
	`vehicle_plate` text NOT NULL,
	`vehicle_type` text NOT NULL,
	`mode` text NOT NULL,
	`units` integer NOT NULL,
	`start_at` integer NOT NULL,
	`end_at` integer NOT NULL,
	`total_paise` integer NOT NULL,
	`status` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `bookings_overlap_idx` ON `bookings` (`listing_id`,`start_at`,`end_at`);--> statement-breakpoint
CREATE INDEX `bookings_guest_idx` ON `bookings` (`guest_id`);--> statement-breakpoint
CREATE INDEX `bookings_host_idx` ON `bookings` (`host_id`);--> statement-breakpoint
CREATE TABLE `favorites` (
	`user_id` text NOT NULL,
	`listing_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `listing_id`)
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`owner_name` text NOT NULL,
	`title` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`area` text NOT NULL,
	`address` text NOT NULL,
	`description` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`parking_type` text NOT NULL,
	`vehicles` text NOT NULL,
	`amenities` text NOT NULL,
	`images` text NOT NULL,
	`hourly_paise` integer,
	`daily_paise` integer,
	`monthly_paise` integer,
	`open_time` text NOT NULL,
	`close_time` text NOT NULL,
	`days` text NOT NULL,
	`length` real NOT NULL,
	`width` real NOT NULL,
	`height` real,
	`instructions` text NOT NULL,
	`rights_confirmed` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`review_note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `listings_owner_idx` ON `listings` (`owner_id`);--> statement-breakpoint
CREATE INDEX `listings_status_city_idx` ON `listings` (`status`,`city`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`topic` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text NOT NULL,
	`created_at` integer NOT NULL
);
