import { z } from "zod";

export const jobFiltersSchema = z.object({
  keyword: z.string().trim().default(""),
  location: z.string().trim().default(""),
  experienceLevel: z.enum(["entry", "any"]).default("entry"),
  minSalary: z.coerce.number().int().min(0).default(65000),
  includeUndisclosed: z.coerce.boolean().default(false),
  sort: z.enum(["posted_desc", "salary_desc"]).default("posted_desc"),
});

export type JobFilters = z.infer<typeof jobFiltersSchema>;

export const DEFAULT_FILTERS: JobFilters = jobFiltersSchema.parse({});

export function parseFiltersFromSearchParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>
): JobFilters {
  const raw =
    params instanceof URLSearchParams
      ? Object.fromEntries(params.entries())
      : params;

  // zod's coerce.boolean() treats any non-empty string (including "false")
  // as true, so normalize explicitly before parsing.
  const normalized = {
    ...raw,
    includeUndisclosed: raw.includeUndisclosed === "true",
  };

  return jobFiltersSchema.parse(normalized);
}
