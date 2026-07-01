import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SalaryBadge } from "@/components/salary-badge";
import { formatRelativeTime } from "@/lib/format";

const SOURCE_LABELS: Record<string, string> = {
  themuse: "The Muse",
  adzuna: "Adzuna",
  usajobs: "USAJobs",
};

export interface JobCardData {
  id: number;
  title: string;
  company: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryDisclosed: boolean;
  source: string;
  url: string;
  postedAt: string | null;
}

export function JobCard({ job }: { job: JobCardData }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold leading-snug hover:underline"
          >
            {job.title}
          </a>
          <div className="text-sm text-muted-foreground">
            {job.company ?? "Unknown company"}
            {job.location ? ` · ${job.location}` : ""}
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {SOURCE_LABELS[job.source] ?? job.source}
        </Badge>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <SalaryBadge
          salaryMin={job.salaryMin}
          salaryMax={job.salaryMax}
          salaryDisclosed={job.salaryDisclosed}
        />
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(job.postedAt)}
        </span>
      </CardContent>
    </Card>
  );
}
