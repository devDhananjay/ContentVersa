"use client";

import * as React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FilterSelectOption = { value: string; label: string };

type AdminListFiltersProps = {
  search?: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  };
  dateFrom?: { value: string; onChange: (v: string) => void; label?: string };
  dateTo?: { value: string; onChange: (v: string) => void; label?: string };
  selects?: {
    id: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    options: FilterSelectOption[];
    className?: string;
  }[];
  resultCount?: number;
  onClear?: () => void;
  showClear?: boolean;
};

export function AdminListFilters({
  search,
  dateFrom,
  dateTo,
  selects = [],
  resultCount,
  onClear,
  showClear,
}: AdminListFiltersProps) {
  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-3">
        {search ? (
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={search.placeholder ?? "Search…"}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              className="pl-9"
            />
          </div>
        ) : null}

        {dateFrom ? (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {dateFrom.label ?? "From"}
            </label>
            <Input
              type="date"
              value={dateFrom.value}
              onChange={(e) => dateFrom.onChange(e.target.value)}
              className="w-[150px]"
            />
          </div>
        ) : null}

        {dateTo ? (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {dateTo.label ?? "To"}
            </label>
            <Input
              type="date"
              value={dateTo.value}
              onChange={(e) => dateTo.onChange(e.target.value)}
              className="w-[150px]"
            />
          </div>
        ) : null}

        {selects.map((s) => (
          <div key={s.id} className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {s.placeholder}
            </label>
            <Select value={s.value} onValueChange={s.onChange}>
              <SelectTrigger className={s.className ?? "w-[160px]"}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {s.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        {showClear && onClear ? (
          <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={onClear}>
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        ) : null}
      </div>

      {typeof resultCount === "number" ? (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Showing <span className="font-semibold text-foreground">{resultCount}</span> result
          {resultCount === 1 ? "" : "s"}
        </p>
      ) : null}
    </div>
  );
}

export function useAdminFilters<T extends Record<string, string>>(defaults: T) {
  const [filters, setFilters] = React.useState(defaults);

  const set = React.useCallback((key: keyof T, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clear = React.useCallback(() => setFilters(defaults), [defaults]);

  const hasActive = React.useMemo(
    () => Object.entries(filters).some(([k, v]) => v !== defaults[k as keyof T]),
    [filters, defaults]
  );

  return { filters, set, clear, hasActive };
}
