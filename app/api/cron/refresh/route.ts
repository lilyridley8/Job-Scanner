import { NextRequest, NextResponse } from "next/server";
import { ingestTheMuse } from "@/lib/ingestion/themuse";
import { ingestAdzuna } from "@/lib/ingestion/adzuna";
import { ingestUsaJobs } from "@/lib/ingestion/usajobs";
import { upsertJobs, markStale } from "@/lib/ingestion/upsert";
import type { JobSource, NormalizedJob } from "@/lib/ingestion/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SOURCES: { name: JobSource; ingest: () => Promise<NormalizedJob[] | null> }[] = [
  { name: "themuse", ingest: ingestTheMuse },
  { name: "adzuna", ingest: ingestAdzuna },
  { name: "usajobs", ingest: ingestUsaJobs },
];

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const runStartedAt = new Date();
  const summary: Record<string, { upserted: number; skipped: boolean; error: string | null }> = {};

  for (const { name, ingest } of SOURCES) {
    try {
      const normalized = await ingest();
      if (normalized === null) {
        summary[name] = { upserted: 0, skipped: true, error: null };
        continue;
      }
      const count = await upsertJobs(normalized);
      await markStale(name, runStartedAt);
      summary[name] = { upserted: count, skipped: false, error: null };
    } catch (err) {
      summary[name] = {
        upserted: 0,
        skipped: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return NextResponse.json({ runStartedAt, summary });
}
