import { JobCard, type JobCardData } from "@/components/job-card";

interface JobListProps {
  jobs: JobCardData[];
  isLoading: boolean;
  error: boolean;
}

export function JobList({ jobs, isLoading, error }: JobListProps) {
  if (error) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Something went wrong loading listings. Try refreshing the page.
      </div>
    );
  }

  if (isLoading && jobs.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border bg-muted/40" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        No entry-level roles match your filters right now — try widening them
        or checking back after the next refresh.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobCard key={`${job.source}-${job.id}`} job={job} />
      ))}
    </div>
  );
}
