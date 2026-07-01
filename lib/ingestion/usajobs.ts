import { classify } from "./classify";
import { normalizeSalary } from "./salary";
import type { NormalizedJob } from "./types";

const BASE_URL = "https://data.usajobs.gov/api/search";
const SEARCH_TERMS = ["data scientist", "data analyst", "machine learning"];

interface UsaJobsItem {
  MatchedObjectId: string;
  MatchedObjectDescriptor: {
    PositionTitle: string;
    PositionURI: string;
    OrganizationName?: string;
    PositionLocationDisplay?: string;
    PositionRemuneration?: { MinimumRange?: string; MaximumRange?: string }[];
    PublicationStartDate?: string;
    QualificationSummary?: string;
    UserArea?: { Details?: { JobSummary?: string } };
  };
}

interface UsaJobsResponse {
  SearchResult: {
    SearchResultItems: UsaJobsItem[];
  };
}

async function fetchForTerm(term: string): Promise<UsaJobsItem[]> {
  const params = new URLSearchParams({
    Keyword: term,
    PayGradeLow: "07",
    ResultsPerPage: "25",
  });

  const res = await fetch(`${BASE_URL}?${params.toString()}`, {
    headers: {
      Host: "data.usajobs.gov",
      "User-Agent": process.env.USAJOBS_USER_AGENT ?? "",
      "Authorization-Key": process.env.USAJOBS_API_KEY ?? "",
    },
  });

  if (!res.ok) {
    throw new Error(`USAJobs API error: ${res.status} ${res.statusText}`);
  }

  const data: UsaJobsResponse = await res.json();
  return data.SearchResult?.SearchResultItems ?? [];
}

export async function ingestUsaJobs(): Promise<NormalizedJob[]> {
  if (!process.env.USAJOBS_API_KEY || !process.env.USAJOBS_USER_AGENT) {
    throw new Error("USAJOBS_API_KEY / USAJOBS_USER_AGENT not configured");
  }

  const jobs: NormalizedJob[] = [];
  const seenIds = new Set<string>();

  for (const term of SEARCH_TERMS) {
    const items = await fetchForTerm(term);

    for (const item of items) {
      if (seenIds.has(item.MatchedObjectId)) continue;
      seenIds.add(item.MatchedObjectId);

      const descriptor = item.MatchedObjectDescriptor;
      const title = descriptor.PositionTitle ?? "";
      const description =
        descriptor.QualificationSummary ?? descriptor.UserArea?.Details?.JobSummary ?? null;

      const result = classify(title, description, false);
      if (!result.passes) continue;

      const remuneration = descriptor.PositionRemuneration?.[0];
      const salary = normalizeSalary(
        remuneration?.MinimumRange ? Number(remuneration.MinimumRange) : null,
        remuneration?.MaximumRange ? Number(remuneration.MaximumRange) : null
      );

      jobs.push({
        source: "usajobs",
        externalId: item.MatchedObjectId,
        title,
        company: descriptor.OrganizationName ?? null,
        location: descriptor.PositionLocationDisplay ?? null,
        salaryMin: salary.salaryMin,
        salaryMax: salary.salaryMax,
        salaryDisclosed: salary.salaryDisclosed,
        experienceLevel: "entry",
        url: descriptor.PositionURI,
        descriptionSnippet: description ? description.slice(0, 600) : null,
        postedAt: descriptor.PublicationStartDate
          ? new Date(descriptor.PublicationStartDate)
          : null,
      });
    }
  }

  return jobs;
}
