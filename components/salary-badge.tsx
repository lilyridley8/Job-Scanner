import { Badge } from "@/components/ui/badge";
import { formatSalaryRange } from "@/lib/format";
import { cn } from "@/lib/utils";

interface SalaryBadgeProps {
  salaryMin: number | null;
  salaryMax: number | null;
  salaryDisclosed: boolean;
}

export function SalaryBadge({ salaryMin, salaryMax, salaryDisclosed }: SalaryBadgeProps) {
  const label = formatSalaryRange(salaryMin, salaryMax, salaryDisclosed);

  return (
    <Badge
      variant="outline"
      className={cn(
        salaryDisclosed
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-gray-200 bg-gray-50 text-gray-500"
      )}
    >
      {label}
    </Badge>
  );
}
