"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plane, MapPin, X, Loader2, Building2, Search } from "lucide-react";
import { searchAirports, POPULAR_AIRPORTS } from "@/lib/data/airportsData";
import type { AirportOption } from "@/lib/data/airportsData";
import { useAirportSearch } from "@/hooks/useAirportSearch";

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

  // ── Debounced Amadeus location search ────────────────────────────────────
  const { results, isLoading, error } = useAirportSearch(query);

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
        {isLoading ? (
          <li className="flex items-center justify-center gap-2.5 px-4 py-4 text-xs font-medium text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
            <span>Searching locations...</span>
          </li>
        ) : error ? (
          <li className="px-4 py-3 text-xs text-rose-500 text-center font-medium">
            {error}
          </li>
        ) : (
          <>
            {groupLabel ? (
              <li className="px-4 py-2 bg-primary/5 border-b border-border">
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                  {groupLabel}
                </span>
              </li>
            ) : query.trim().length < 2 ? (
              <li className="px-4 py-2 border-b border-border">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Popular destinations
                </span>
              </li>
            ) : null}

            {results.length === 0 && query.trim().length >= 2 && (
              <li className="px-4 py-4 text-sm text-muted-foreground text-center">
                No airports or cities found
              </li>
            )}

            {results.slice(0, 8).map((a, i) => (
              <li key={`${a.code}-${i}`} role="option" aria-selected={i === activeIdx}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); select(a); }}
                  onTouchEnd={(e) => { e.preventDefault(); select(a); }}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left active:bg-primary/10 ${
                    i === activeIdx ? "bg-accent" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    {a.type === "CITY"
                      ? <Building2 className="h-4 w-4 text-indigo-500" />
                      : <Plane className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-bold text-foreground truncate">{a.city}</span>
                    <span className="text-xs text-muted-foreground truncate">{a.name}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md font-mono">
                      {a.code}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[90px] mt-0.5">
                      {a.country}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </>
        )}
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
              className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
              onClick={() => setOpen(false)}
            />

            {/* Sheet */}
            <div
              className="fixed inset-x-0 bottom-0 z-[80] bg-white rounded-t-3xl shadow-2xl flex flex-col border-t border-slate-100 animate-in slide-in-from-bottom duration-250"
              style={{ maxHeight: "85vh" }}
            >
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 shrink-0" />

              {/* Sheet header with its own input */}
              <div className="flex items-center gap-2.5 px-4 pb-3 border-b border-slate-100">
                <div className="flex-1 flex items-center gap-2 bg-slate-100/90 rounded-2xl px-3.5 py-2 border border-slate-200/80 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <Search className="h-4 w-4 text-primary shrink-0" />
                  <input
                    ref={sheetInputRef}
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={query}
                    placeholder={placeholder}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className="flex-1 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none bg-transparent"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => { setQuery(""); setActiveIdx(-1); }}
                      className="h-5 w-5 rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 flex items-center justify-center transition-colors shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="shrink-0 h-9 w-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Results */}
              <ul role="listbox" className="overflow-y-auto flex-1 pb-28 divide-y divide-slate-100">
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
          className="w-[340px] overflow-hidden no-scrollbar rounded-xl border border-border bg-card"
          style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
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
