export type JobSource = "adzuna" | "themuse" | "usajobs";

export interface NormalizedJob {
  source: JobSource;
  externalId: string;
  title: string;
  company: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryDisclosed: boolean;
  experienceLevel: "entry" | null;
  url: string;
  descriptionSnippet: string | null;
  postedAt: Date | null;
}
