import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import type { JobSource } from "./types";

/**
 * Returns true if `source` was fetched more recently than minIntervalHours
 * ago, meaning this run should skip it. Needed for sources with tight free-
 * tier call budgets (Adzuna: ~250 calls/month, roughly 8/day) that can't
 * tolerate being hit on every 15-minute cron tick.
 */
export async function shouldThrottle(
  source: JobSource,
  minIntervalHours: number
): Promise<boolean> {
  const [mostRecent] = await db
    .select({ fetchedAt: jobs.fetchedAt })
    .from(jobs)
    .where(eq(jobs.source, source))
    .orderBy(desc(jobs.fetchedAt))
    .limit(1);

  if (!mostRecent) return false;

  const elapsedMs = Date.now() - mostRecent.fetchedAt.getTime();
  return elapsedMs < minIntervalHours * 60 * 60 * 1000;
}
