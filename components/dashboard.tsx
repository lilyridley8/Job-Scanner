"use client";

import useSWR from "swr";
import { useJobFilters } from "@/hooks/use-job-filters";
import { FilterPanel } from "@/components/filter-panel";
import { JobList } from "@/components/job-list";
import type { JobCardData } from "@/components/job-card";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch jobs");
    return res.json();
  });

const REFRESH_INTERVAL_MS = 60_000;

export function Dashboard() {
  const { filters, setFilters } = useJobFilters();

  const params = new URLSearchParams({
    keyword: filters.keyword,
    location: filters.location,
    experienceLevel: filters.experienceLevel,
    minSalary: String(filters.minSalary),
    includeUndisclosed: String(filters.includeUndisclosed),
    sort: filters.sort,
  });

  const { data, error, isLoading } = useSWR<{ jobs: JobCardData[]; total: number }>(
    `/api/jobs?${params.toString()}`,
    fetcher,
    { refreshInterval: REFRESH_INTERVAL_MS, revalidateOnFocus: true }
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Entry-Level AI &amp; Data Jobs
        </h1>
        <p className="text-sm text-muted-foreground">
          Fresh entry-level Data Science, Data Analysis, and AI/ML postings —
          refreshed automatically every 15 minutes.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
        <aside className="md:sticky md:top-6 md:self-start">
          <FilterPanel filters={filters} onChange={setFilters} />
        </aside>

        <main>
          <div className="mb-3 text-sm text-muted-foreground">
            {isLoading ? "Loading…" : `${data?.total ?? 0} job${data?.total === 1 ? "" : "s"} found`}
          </div>
          <JobList jobs={data?.jobs ?? []} isLoading={isLoading} error={!!error} />
        </main>
      </div>
    </div>
  );
}
