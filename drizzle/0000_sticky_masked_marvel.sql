CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"external_id" text NOT NULL,
	"title" text NOT NULL,
	"company" text,
	"location" text,
	"salary_min" integer,
	"salary_max" integer,
	"salary_disclosed" boolean DEFAULT false NOT NULL,
	"experience_level" text,
	"url" text NOT NULL,
	"description_snippet" text,
	"posted_at" timestamp with time zone,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "jobs_source_external_id_unique" UNIQUE("source","external_id")
);
--> statement-breakpoint
CREATE INDEX "jobs_is_active_idx" ON "jobs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "jobs_posted_at_idx" ON "jobs" USING btree ("posted_at");