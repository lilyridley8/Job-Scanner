import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ilike, or, sql, SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { parseFiltersFromSearchParams } from "@/lib/filters/query-params";

export const dynamic = "force-dynamic";

// Handles both "both present" and "only one present" salary rows the same
// way normalizeSalary()/medianSalary() do in lib/ingestion/salary.ts.
const medianSalaryExpr = sql`COALESCE((${jobs.salaryMin} + ${jobs.salaryMax}) / 2, ${jobs.salaryMin}, ${jobs.salaryMax})`;

export async function GET(req: NextRequest) {
  const filters = parseFiltersFromSearchParams(req.nextUrl.searchParams);

  const conditions: SQL[] = [eq(jobs.isActive, true)];

  if (filters.keyword) {
    const pattern = `%${filters.keyword}%`;
    conditions.push(
      or(ilike(jobs.title, pattern), ilike(jobs.descriptionSnippet, pattern))!
    );
  }

  if (filters.location) {
    conditions.push(ilike(jobs.location, `%${filters.location}%`));
  }

  if (filters.experienceLevel !== "any") {
    conditions.push(eq(jobs.experienceLevel, filters.experienceLevel));
  }

  const salaryCondition = or(
    and(eq(jobs.salaryDisclosed, true), sql`${medianSalaryExpr} >= ${filters.minSalary}`),
    filters.includeUndisclosed ? eq(jobs.salaryDisclosed, false) : sql`false`
  )!;
  conditions.push(salaryCondition);

  const orderBy =
    filters.sort === "salary_desc" ? desc(medianSalaryExpr) : desc(jobs.postedAt);

  const results = await db
    .select()
    .from(jobs)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(100);

  return NextResponse.json({ jobs: results, total: results.length });
}
