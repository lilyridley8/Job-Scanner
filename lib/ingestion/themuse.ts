import { classify } from "./classify";
import { normalizeSalary } from "./salary";
import type { NormalizedJob } from "./types";

const BASE_URL = "https://www.themuse.com/api/public/jobs";

// The Muse's category taxonomy is noisy (its "Data and Analytics" category
// mixes in meat cutters and physicians alongside real data roles), so these
// are just candidate pools — classify() does the real filtering.
const CATEGORIES = ["Data and Analytics", "Science and Engineering"];
const MAX_PAGES_PER_CATEGORY = 3;

interface MuseJob {
  id: number;
  name: string;
  contents: string;
  publication_date: string;
  locations: { name: string }[];
  levels: { name: string; short_name: string }[];
  refs: { landing_page: string };
  company: { name: string } | null;
}

interface MuseResponse {
  page: number;
  page_count: number;
  results: MuseJob[];
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);
}

async function fetchPage(category: string, page: number): Promise<MuseResponse> {
  const params = new URLSearchParams({
    category,
    level: "Entry Level",
    page: String(page),
  });
  if (process.env.THEMUSE_API_KEY) {
    params.set("api_key", process.env.THEMUSE_API_KEY);
  }

  const res = await fetch(`${BASE_URL}?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`The Muse API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function ingestTheMuse(): Promise<NormalizedJob[]> {
  const jobs: NormalizedJob[] = [];

  for (const category of CATEGORIES) {
    let page = 0;
    let pageCount = 1;

    do {
      const data = await fetchPage(category, page);
      pageCount = data.page_count;

      for (const item of data.results) {
        const title = item.name;
        const description = stripHtml(item.contents ?? "");
        const nativeEntryLevelHint = item.levels?.some(
          (l) => l.short_name === "entry" || l.name === "Entry Level"
        );

        const result = classify(title, description, !!nativeEntryLevelHint);
        if (!result.passes) continue;

        const salary = normalizeSalary(null, null); // The Muse never returns structured salary data

        jobs.push({
          source: "themuse",
          externalId: String(item.id),
          title,
          company: item.company?.name ?? null,
          location: item.locations?.map((l) => l.name).join("; ") || null,
          salaryMin: salary.salaryMin,
          salaryMax: salary.salaryMax,
          salaryDisclosed: salary.salaryDisclosed,
          experienceLevel: "entry",
          url: item.refs?.landing_page,
          descriptionSnippet: description || null,
          postedAt: item.publication_date ? new Date(item.publication_date) : null,
        });
      }

      page += 1;
    } while (page < pageCount && page < MAX_PAGES_PER_CATEGORY);
  }

  return jobs;
}
