export interface SalaryInfo {
  salaryMin: number | null;
  salaryMax: number | null;
  salaryDisclosed: boolean;
}

/**
 * Normalizes raw min/max salary figures from a source into our stored shape.
 * Treats 0 or missing values as "not disclosed" rather than a real figure —
 * several APIs (Adzuna in particular) return 0 instead of omitting the field.
 */
export function normalizeSalary(
  rawMin: number | null | undefined,
  rawMax: number | null | undefined
): SalaryInfo {
  const min = rawMin && rawMin > 0 ? Math.round(rawMin) : null;
  const max = rawMax && rawMax > 0 ? Math.round(rawMax) : null;

  if (min === null && max === null) {
    return { salaryMin: null, salaryMax: null, salaryDisclosed: false };
  }

  return { salaryMin: min, salaryMax: max, salaryDisclosed: true };
}

export function medianSalary(min: number | null, max: number | null): number | null {
  if (min !== null && max !== null) return Math.round((min + max) / 2);
  if (min !== null) return min;
  if (max !== null) return max;
  return null;
}
