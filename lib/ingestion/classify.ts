const ALLOWLIST = [
  "data scientist",
  "data science",
  "data analyst",
  "data analytics",
  "machine learning engineer",
  "machine learning",
  "ml engineer",
  "ai engineer",
  "artificial intelligence",
  "business intelligence analyst",
  "business analyst",
  "quantitative analyst",
  "research analyst",
];

const ENTRY_SIGNALS = [
  "entry level",
  "entry-level",
  "new grad",
  "new graduate",
  "associate",
  "junior",
  "0-2 years",
  "0-1 years",
  "1-2 years",
  "no experience required",
];

const DENYLIST = [
  "data entry",
  "senior",
  "staff",
  "principal",
  "director",
  "tech lead",
  "team lead",
  "lead engineer",
  "lead analyst",
  "lead data",
  "5+ years",
  "6+ years",
  "7+ years",
  "8+ years",
  "10+ years",
  "phd required",
  "phd preferred",
  "manager",
  "supervisory",
  "head of",
  "vp ",
  "vice president",
];

function containsAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

export interface ClassifyResult {
  isRelevantRole: boolean;
  isEntryLevel: boolean;
  isDenied: boolean;
  passes: boolean;
}

/**
 * Uniform keyword classifier applied to every source (none of the three
 * APIs' native category/level tags are trustworthy enough on their own —
 * The Muse's "Data and Analytics" category mixes in meat cutters and
 * physicians alongside real data roles).
 */
export function classify(
  title: string,
  description: string | null,
  nativeEntryLevelHint: boolean
): ClassifyResult {
  const text = `${title} ${description ?? ""}`.toLowerCase();

  const isDenied = containsAny(text, DENYLIST);
  const isRelevantRole = containsAny(text, ALLOWLIST);
  const isEntryLevel = nativeEntryLevelHint || containsAny(text, ENTRY_SIGNALS);

  return {
    isRelevantRole,
    isEntryLevel,
    isDenied,
    passes: isRelevantRole && isEntryLevel && !isDenied,
  };
}
