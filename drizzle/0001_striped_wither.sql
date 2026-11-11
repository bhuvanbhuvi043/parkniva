CREATE TABLE `chargers` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`title` text NOT NULL,
	`city` text NOT NULL,
	`area` text NOT NULL,
	`address` text NOT NULL,
	`description` text NOT NULL,
	`vehicle_type` text NOT NULL,
	`connector` text NOT NULL,
	`power_kw` real NOT NULL,
	`cable` text NOT NULL,
	`price_basis` text NOT NULL,
	`rate_paise` integer NOT NULL,
	`session_minutes` integer NOT NULL,
	`max_kwh` real NOT NULL,
	`open_time` text NOT NULL,
	`close_time` text NOT NULL,
	`image` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`review_note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `chargers_status_idx` ON `chargers` (`status`);--> statement-breakpoint
CREATE INDEX `chargers_owner_idx` ON `chargers` (`owner_id`);--> statement-breakpoint
CREATE TABLE `charging_bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`charger_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`host_id` text NOT NULL,
	`title` text NOT NULL,
	`guest_name` text NOT NULL,
	`vehicle_model` text NOT NULL,
	`vehicle_type` text NOT NULL,
	`start_at` integer NOT NULL,
	`end_at` integer NOT NULL,
	`requested_kwh` real NOT NULL,
	`rate_paise` integer NOT NULL,
	`price_basis` text NOT NULL,
	`quote_paise` integer NOT NULL,
	`status` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`snapshot` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `charging_overlap_idx` ON `charging_bookings` (`charger_id`,`start_at`,`end_at`);--> statement-breakpoint
CREATE INDEX `charging_guest_idx` ON `charging_bookings` (`guest_id`);--> statement-breakpoint
CREATE INDEX `charging_host_idx` ON `charging_bookings` (`host_id`);