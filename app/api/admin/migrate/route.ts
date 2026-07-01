import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

// Temporary one-off endpoint to apply the initial schema on the live Neon
// DB (its credentials are marked "sensitive" by Vercel and can't be pulled
// locally, so drizzle-kit can't be run against it from this machine).
// Delete this route after running it once.
const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "jobs" (
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
  )`,
  `CREATE INDEX IF NOT EXISTS "jobs_is_active_idx" ON "jobs" USING btree ("is_active")`,
  `CREATE INDEX IF NOT EXISTS "jobs_posted_at_idx" ON "jobs" USING btree ("posted_at")`,
];

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = neon(process.env.DATABASE_URL!);
  for (const statement of STATEMENTS) {
    await sql.query(statement);
  }

  return NextResponse.json({ ok: true });
}
