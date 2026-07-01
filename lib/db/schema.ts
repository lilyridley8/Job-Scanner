import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  unique,
  index,
} from "drizzle-orm/pg-core";

export const jobs = pgTable(
  "jobs",
  {
    id: serial("id").primaryKey(),
    source: text("source").notNull(), // "adzuna" | "themuse" | "usajobs"
    externalId: text("external_id").notNull(),
    title: text("title").notNull(),
    company: text("company"),
    location: text("location"),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryDisclosed: boolean("salary_disclosed").notNull().default(false),
    experienceLevel: text("experience_level"), // "entry" for v1
    url: text("url").notNull(),
    descriptionSnippet: text("description_snippet"),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    fetchedAt: timestamp("fetched_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => ({
    sourceExternalIdUnique: unique("jobs_source_external_id_unique").on(
      table.source,
      table.externalId
    ),
    activeIdx: index("jobs_is_active_idx").on(table.isActive),
    postedAtIdx: index("jobs_posted_at_idx").on(table.postedAt),
  })
);

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
