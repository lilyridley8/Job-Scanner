import { classify } from "./classify";
import { normalizeSalary } from "./salary";
import { shouldThrottle } from "./throttle";
import type { NormalizedJob } from "./types";

const BASE_URL = "https://api.adzuna.com/v1/api/jobs/us/search/1";

// Free tier is ~250 calls/month (~8/day). One call per throttle window,
// rotating through search terms, keeps us comfortably under quota even
// though the cron trigger itself fires every 15 minutes.
const THROTTLE_HOURS = 3;
const SEARCH_TERMS = ["data scientist", "data analyst", "machine learning engineer"];

interface AdzunaJob {
  id: string;
  title: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  salary_min?: number;
  salary_max?: number;
  redirect_url: string;
  created?: string;
  description?: string;
}

interface AdzunaResponse {
  results: AdzunaJob[];
}

// null return means "skipped this tick due to throttling" — callers must
// treat that differently from an empty result set (skip must not trigger
// staleness marking, or a throttled tick would wrongly deactivate jobs
// fetched within the current throttle window).
export async function ingestAdzuna(): Promise<NormalizedJob[] | null> {
  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
    throw new Error("ADZUNA_APP_ID / ADZUNA_APP_KEY not configured");
  }

  if (await shouldThrottle("adzuna", THROTTLE_HOURS)) {
    return null;
  }

  const term = SEARCH_TERMS[Math.floor(Date.now() / (THROTTLE_HOURS * 60 * 60 * 1000)) % SEARCH_TERMS.length];

  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID,
    app_key: process.env.ADZUNA_APP_KEY,
    what: term,
    results_per_page: "50",
    max_days_old: "2",
    "content-type": "application/json",
  });

  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Adzuna API error: ${res.status} ${res.statusText}`);
  }
  const data: AdzunaResponse = await res.json();

  const jobs: NormalizedJob[] = [];

  for (const item of data.results ?? []) {
    const title = item.title ?? "";
    const description = item.description ?? null;

    const result = classify(title, description, false);
    if (!result.passes) continue;

    const salary = normalizeSalary(item.salary_min, item.salary_max);

    jobs.push({
      source: "adzuna",
      externalId: item.id,
      title,
      company: item.company?.display_name ?? null,
      location: item.location?.display_name ?? null,
      salaryMin: salary.salaryMin,
      salaryMax: salary.salaryMax,
      salaryDisclosed: salary.salaryDisclosed,
      experienceLevel: "entry",
      url: item.redirect_url,
      descriptionSnippet: description ? description.slice(0, 600) : null,
      postedAt: item.created ? new Date(item.created) : null,
    });
  }

  return jobs;
}
