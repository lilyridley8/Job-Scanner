"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_FILTERS,
  JobFilters,
  parseFiltersFromSearchParams,
} from "@/lib/filters/query-params";

const STORAGE_KEY = "job-tracker-filters";

function readStoredFilters(): Partial<JobFilters> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useJobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initial = useMemo(() => {
    if (searchParams.toString().length > 0) {
      return parseFiltersFromSearchParams(searchParams);
    }
    const stored = readStoredFilters();
    return stored
      ? parseFiltersFromSearchParams(stored as Record<string, string>)
      : DEFAULT_FILTERS;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [filters, setFiltersState] = useState<JobFilters>(initial);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.keyword) params.set("keyword", filters.keyword);
    if (filters.location) params.set("location", filters.location);
    if (filters.experienceLevel !== DEFAULT_FILTERS.experienceLevel)
      params.set("experienceLevel", filters.experienceLevel);
    if (filters.minSalary !== DEFAULT_FILTERS.minSalary)
      params.set("minSalary", String(filters.minSalary));
    if (filters.includeUndisclosed)
      params.set("includeUndisclosed", String(filters.includeUndisclosed));
    if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);

    router.replace(params.toString() ? `/?${params.toString()}` : "/", {
      scroll: false,
    });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters, router]);

  const setFilters = useCallback((partial: Partial<JobFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  return { filters, setFilters };
}
