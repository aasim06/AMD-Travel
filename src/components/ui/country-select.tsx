"use client";

import { useState, useRef, useEffect, useMemo, useDeferredValue } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { WORLD_PHONE_CODES } from "@/components/ui/phone-code-select";

// Derive a flat country list (name + flag) from the shared world list
export const WORLD_COUNTRIES = WORLD_PHONE_CODES.map(({ name, flag }) => ({ name, flag }));

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
}

export function CountrySelect({
  value,
  onChange,
  placeholder = "Select country",
  hasError,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const deferredSearch = useDeferredValue(search);

  const selected = useMemo(() => WORLD_COUNTRIES.find((c) => c.name === value), [value]);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return WORLD_COUNTRIES;
    return WORLD_COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [deferredSearch]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setSearch("");
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full h-10 flex items-center justify-between gap-1.5 px-3 rounded-lg border bg-white text-sm transition-all",
            "hover:border-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            hasError ? "border-red-400" : "border-slate-300"
          )}
        >
          {selected ? (
            <span className="flex items-center gap-2 min-w-0">
              <span className="text-base leading-none">{selected.flag}</span>
              <span className="text-slate-800 truncate">{selected.name}</span>
            </span>
          ) : (
            <span className="text-slate-400 truncate">{placeholder}</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-72 p-0 shadow-lg overflow-hidden"
      >
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country…"
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400 text-slate-800"
          />
        </div>

        {/* List */}
        <ul className="max-h-56 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400">No results</li>
          ) : (
            filtered.map((c) => (
              <li
                key={c.name}
                onClick={() => { onChange(c.name); setOpen(false); }}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 cursor-pointer text-sm transition-colors",
                  "hover:bg-slate-50 active:bg-slate-100",
                  c.name === value
                    ? "bg-primary/5 text-primary font-medium"
                    : "text-slate-700"
                )}
              >
                <span className="text-base leading-none w-5 text-center shrink-0">{c.flag}</span>
                <span className="flex-1 truncate">{c.name}</span>
                {c.name === value && (
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
