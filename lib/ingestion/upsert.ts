import { and, eq, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import type { NormalizedJob, JobSource } from "./types";

export async function upsertJobs(normalized: NormalizedJob[]): Promise<number> {
  if (normalized.length === 0) return 0;

  for (const job of normalized) {
    await db
      .insert(jobs)
      .values({
        source: job.source,
        externalId: job.externalId,
        title: job.title,
        company: job.company,
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryDisclosed: job.salaryDisclosed,
        experienceLevel: job.experienceLevel,
        url: job.url,
        descriptionSnippet: job.descriptionSnippet,
        postedAt: job.postedAt,
        fetchedAt: new Date(),
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [jobs.source, jobs.externalId],
        set: {
          title: job.title,
          company: job.company,
          location: job.location,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          salaryDisclosed: job.salaryDisclosed,
          experienceLevel: job.experienceLevel,
          url: job.url,
          descriptionSnippet: job.descriptionSnippet,
          postedAt: job.postedAt,
          fetchedAt: sql`now()`,
          isActive: true,
        },
      });
  }

  return normalized.length;
}

/**
 * Marks jobs from this source stale if they weren't seen in the run that
 * started at runStartedAt. Scoped per-source so one source's API failure
 * (which would skip its upsert pass entirely) can't deactivate another
 * source's still-fresh listings.
 */
export async function markStale(source: JobSource, runStartedAt: Date): Promise<void> {
  await db
    .update(jobs)
    .set({ isActive: false })
    .where(and(eq(jobs.source, source), lt(jobs.fetchedAt, runStartedAt)));
}
