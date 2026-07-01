export function formatRelativeTime(value: string | Date | null): string {
  if (!value) return "Unknown date";
  const date = typeof value === "string" ? new Date(value) : value;
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.round(diffDay / 30);
  return `${diffMonth}mo ago`;
}

function formatCompactSalary(value: number): string {
  return `$${Math.round(value / 1000)}k`;
}

export function formatSalaryRange(
  min: number | null,
  max: number | null,
  disclosed: boolean
): string {
  if (!disclosed || (min === null && max === null)) return "Salary not disclosed";
  if (min !== null && max !== null && min !== max) {
    return `${formatCompactSalary(min)}–${formatCompactSalary(max)}`;
  }
  return formatCompactSalary(min ?? max ?? 0);
}
