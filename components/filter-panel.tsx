"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { JobFilters } from "@/lib/filters/query-params";

interface FilterPanelProps {
  filters: JobFilters;
  onChange: (partial: Partial<JobFilters>) => void;
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  return (
    <div className="flex flex-col gap-6 rounded-xl border bg-card p-5">
      <div className="space-y-2">
        <Label htmlFor="keyword">Role or keyword</Label>
        <Input
          id="keyword"
          placeholder="e.g. data analyst, machine learning"
          value={filters.keyword}
          onChange={(e) => onChange({ keyword: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="e.g. San Francisco, Remote"
          value={filters.location}
          onChange={(e) => onChange({ location: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Experience level</Label>
        <div className="flex gap-2">
          {(["entry", "any"] as const).map((level) => (
            <Button
              key={level}
              type="button"
              size="sm"
              variant={filters.experienceLevel === level ? "default" : "outline"}
              className="flex-1"
              onClick={() => onChange({ experienceLevel: level })}
            >
              {level === "entry" ? "Entry level" : "Any level"}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="minSalary">Minimum salary</Label>
          <span className="text-sm font-medium text-muted-foreground">
            ${filters.minSalary.toLocaleString()}
          </span>
        </div>
        <Slider
          id="minSalary"
          min={0}
          max={150000}
          step={5000}
          value={[filters.minSalary]}
          onValueChange={(value) =>
            onChange({ minSalary: Array.isArray(value) ? value[0] : value })
          }
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="includeUndisclosed"
          checked={filters.includeUndisclosed}
          onCheckedChange={(checked) =>
            onChange({ includeUndisclosed: checked === true })
          }
        />
        <Label htmlFor="includeUndisclosed" className="font-normal">
          Include postings with no salary listed
        </Label>
      </div>

      <div className="space-y-2">
        <Label>Sort by</Label>
        <div className="flex gap-2">
          {(
            [
              { value: "posted_desc", label: "Newest" },
              { value: "salary_desc", label: "Highest salary" },
            ] as const
          ).map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={filters.sort === option.value ? "default" : "outline"}
              className={cn("flex-1")}
              onClick={() => onChange({ sort: option.value })}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
