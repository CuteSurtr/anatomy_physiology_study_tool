CREATE TABLE "question_stats" (
	"question_key" text PRIMARY KEY NOT NULL,
	"page_path" text,
	"total_attempts" integer DEFAULT 0 NOT NULL,
	"correct_attempts" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_codes" (
	"code" text PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "sync_codes" ADD CONSTRAINT "sync_codes_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sync_codes_expires_idx" ON "sync_codes" USING btree ("expires_at");