"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Plane, MapPin, X } from "lucide-react";
import { searchAirports, POPULAR_AIRPORTS } from "@/lib/data/airportsData";
import type { AirportOption } from "@/lib/data/airportsData";

export type { AirportOption } from "@/lib/data/airportsData";
export { POPULAR_AIRPORTS };

export function AirportInput({
  id,
  value,
  onChange,
  placeholder,
  icon,
  label,
  mobileSheet,
}: {
  id:          string;
  value:       string;
  onChange:    (val: string, display: string) => void;
  placeholder: string;
  icon:        React.ReactNode;
  label:       string;
  mobileSheet?: boolean;
}) {
  const [open, setOpen]           = useState(false);
  const [query, setQuery]         = useState("");
  const [activeIdx, setActiveIdx] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const sheetInputRef = useRef<HTMLInputElement>(null);

  // ── Close on outside click (desktop only) ────────────────────────────────
  useEffect(() => {
    if (mobileSheet) return;
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [mobileSheet]);

  // ── Lock body scroll while mobile sheet is open ───────────────────────────
  useEffect(() => {
    if (!mobileSheet || !open) return;
    const y = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top      = `-${y}px`;
    document.body.style.width    = "100%";
    // Focus the sheet's own input WITHOUT scrolling the page
    requestAnimationFrame(() => {
      sheetInputRef.current?.focus({ preventScroll: true });
    });
    return () => {
      document.body.style.position = "";
      document.body.style.top      = "";
      document.body.style.width    = "";
      window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
    };
  }, [mobileSheet, open]);

  // ── Sync display when value changes externally (e.g. swap) ───────────────
  useEffect(() => {
    if (!value) { setQuery(""); return; }
    if (query.toUpperCase().includes(value.toUpperCase())) return;
    const match = searchAirports(value)[0];
    if (match) setQuery(`${match.city} (${match.code})`);
    else        setQuery(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // ── Search results ────────────────────────────────────────────────────────
  const results: AirportOption[] = useMemo(() => {
    const q = query.trim();
    if (q.length < 2) return POPULAR_AIRPORTS;
    return searchAirports(q).slice(0, 12);
  }, [query]);

  const groupLabel = results[0]?.isCountryMatch ? results[0].groupLabel : null;

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setActiveIdx(-1);
  }

  function select(a: AirportOption) {
    const display = `${a.city} (${a.code})`;
    onChange(a.code, display);
    setQuery(display);
    setOpen(false);
    setActiveIdx(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && results[activeIdx]) select(results[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIdx(-1);
      inputRef.current?.blur();
    }
  }

  // ── Result list (shared between desktop dropdown & mobile sheet) ──────────
  function ResultList() {
    return (
      <>
        {groupLabel ? (
          <li className="px-4 py-2 bg-primary/5 border-b border-border">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
              {groupLabel}
            </span>
          </li>
        ) : query.length < 2 ? (
          <li className="px-4 py-2 border-b border-border">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Popular airports
            </span>
          </li>
        ) : null}

        {results.length === 0 && (
          <li className="px-4 py-4 text-sm text-muted-foreground text-center">
            No airports found
          </li>
        )}

        {results.map((a, i) => (
          <li key={`${a.code}-${i}`} role="option" aria-selected={i === activeIdx}>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); select(a); }}
              onTouchEnd={(e) => { e.preventDefault(); select(a); }}
              onMouseEnter={() => setActiveIdx(i)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                i === activeIdx ? "bg-accent" : "hover:bg-accent"
              }`}
            >
              <span className="shrink-0 text-muted-foreground">
                {a.type === "AIRPORT"
                  ? <Plane  className="h-3.5 w-3.5" />
                  : <MapPin className="h-3.5 w-3.5" />}
              </span>
              <span className="text-xs font-bold text-primary w-9 shrink-0">{a.code}</span>
              <span className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-foreground truncate">{a.city}</span>
                <span className="text-[11px] text-muted-foreground truncate">{a.name}</span>
              </span>
              <span className="text-[11px] text-muted-foreground ml-auto shrink-0 pl-2">
                {a.country}
              </span>
            </button>
          </li>
        ))}
      </>
    );
  }

  // ── MOBILE layout ─────────────────────────────────────────────────────────
  if (mobileSheet) {
    return (
      <div className="relative flex-1 min-w-0">
        {/* Fake tap target — does NOT focus a real input, so no scroll jump */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex-1 w-full bg-transparent text-sm font-medium text-left focus:outline-none min-w-0 truncate"
        >
          {query
            ? <span className="text-foreground">{query}</span>
            : <span className="text-muted-foreground">{placeholder}</span>
          }
        </button>

        {/* Full-screen sheet — rendered in a portal-like fixed overlay */}
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setOpen(false)}
            />

            {/* Sheet */}
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl flex flex-col"
              style={{ maxHeight: "80vh" }}
            >
              {/* Sheet header with its own input */}
              <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
                <input
                  ref={sheetInputRef}
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={query}
                  placeholder={placeholder}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className="flex-1 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none bg-slate-100 rounded-lg px-3 py-2.5"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Results */}
              <ul role="listbox" className="overflow-y-auto flex-1 pb-safe">
                <ResultList />
              </ul>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── DESKTOP layout ────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <label
        htmlFor={id}
        className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1 px-1"
      >
        {label}
      </label>

      <div className="flex items-center gap-2 h-14 rounded-xl border border-border bg-card px-3 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
        <span className="text-primary shrink-0">{icon}</span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={query}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onBlur={() => { /* keep open until mousedown outside */ }}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
        />
      </div>

      <PortalDropdown open={open} anchorRef={containerRef}>
        <ul
          role="listbox"
          className="w-[340px] max-h-72 overflow-y-auto no-scrollbar rounded-xl border border-border bg-card shadow-card-hover"
        >
          <ResultList />
        </ul>
      </PortalDropdown>
    </div>
  );
}

// ── Portal dropdown — renders outside all stacking contexts ──────────────────
function PortalDropdown({
  open,
  anchorRef,
  children,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}) {
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (!open || !anchorRef.current) { setCoords(null); return; }
    function reposition() {
      if (!anchorRef.current) return;
      const r = anchorRef.current.getBoundingClientRect();
      // Use fixed positioning — coords are viewport-relative, no scroll offset needed
      setCoords({ top: r.bottom + 6, left: r.left, width: r.width });
    }
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, anchorRef]);

  if (!open || !coords) return null;

  return createPortal(
    <div
      className="fixed z-[9999]"
      style={{ top: coords.top, left: coords.left, minWidth: coords.width }}
    >
      {children}
    </div>,
    document.body
  );
}
