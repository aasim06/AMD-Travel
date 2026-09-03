"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExtendedCalendarProps {
  fromYear?: number;
  toYear?: number;
}

export type CalendarProps = React.ComponentProps<typeof DayPicker> & ExtendedCalendarProps;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function Calendar({ className, classNames, showOutsideDays = true, fromYear, toYear, ...props }: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(() => {
    const sel = (props as { selected?: Date }).selected;
    if (sel instanceof Date) return sel;
    return (props as { defaultMonth?: Date }).defaultMonth ?? new Date();
  });

  const [view, setView] = React.useState<"days" | "months" | "years">("days");
  const [yearPageStart, setYearPageStart] = React.useState<number>(() => {
    const y = month.getFullYear();
    return Math.floor(y / 12) * 12;
  });

  React.useEffect(() => {
    const sel = (props as { selected?: Date }).selected;
    if (sel instanceof Date) {
      setMonth(sel);
    }
  }, [(props as { selected?: Date }).selected]);

  const openYearsView = () => {
    setYearPageStart(Math.floor(month.getFullYear() / 12) * 12);
    setView("years");
  };

  const handleSelectYear = (yr: number) => {
    const next = new Date(month);
    next.setFullYear(yr);
    setMonth(next);
    setView("months");
  };

  const handleSelectMonth = (mIdx: number) => {
    const next = new Date(month);
    next.setMonth(mIdx);
    setMonth(next);
    setView("days");
  };

  const minYear = fromYear ?? 1920;
  const maxYear = toYear ?? new Date().getFullYear() + 35;

  return (
    <div className={cn("p-3 select-none min-w-[280px]", className)}>
      {/* ── View Switcher: YEARS GRID ── */}
      {view === "years" && (
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between h-9 px-1">
            <button
              type="button"
              onClick={() => setYearPageStart(prev => Math.max(minYear, prev - 12))}
              className="h-7 w-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-slate-800">
              {yearPageStart} – {yearPageStart + 11}
            </span>
            <button
              type="button"
              onClick={() => setYearPageStart(prev => Math.min(maxYear - 11, prev + 12))}
              className="h-7 w-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* 12-Year Grid */}
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }, (_, i) => yearPageStart + i).map((y) => {
              const isSelected = month.getFullYear() === y;
              const isCurrent = new Date().getFullYear() === y;
              const isOut = y < minYear || y > maxYear;

              return (
                <button
                  key={y}
                  type="button"
                  disabled={isOut}
                  onClick={() => handleSelectYear(y)}
                  className={cn(
                    "h-9 rounded-lg text-xs font-semibold transition-all border",
                    isSelected
                      ? "bg-primary text-white border-primary shadow-sm font-bold"
                      : isCurrent
                      ? "border-primary/40 text-primary bg-primary/5 hover:bg-primary/10"
                      : "border-slate-200 text-slate-700 bg-white hover:bg-slate-100 hover:border-slate-300",
                    isOut && "opacity-30 cursor-not-allowed hover:bg-white hover:border-slate-200"
                  )}
                >
                  {y}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setView("days")}
            className="w-full py-1 text-center text-[11px] font-medium text-slate-400 hover:text-primary transition-colors"
          >
            ← Back to calendar
          </button>
        </div>
      )}

      {/* ── View Switcher: MONTHS GRID ── */}
      {view === "months" && (
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between h-9 px-1">
            <span className="text-xs font-bold text-slate-800">
              Select Month · {month.getFullYear()}
            </span>
            <button
              type="button"
              onClick={openYearsView}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Change Year
            </button>
          </div>

          {/* 12-Month Grid */}
          <div className="grid grid-cols-3 gap-2">
            {MONTH_SHORT.map((m, idx) => {
              const isSelected = month.getMonth() === idx;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelectMonth(idx)}
                  className={cn(
                    "h-9 rounded-lg text-xs font-semibold transition-all border",
                    isSelected
                      ? "bg-primary text-white border-primary shadow-sm font-bold"
                      : "border-slate-200 text-slate-700 bg-white hover:bg-slate-100 hover:border-slate-300"
                  )}
                >
                  {m}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setView("days")}
            className="w-full py-1 text-center text-[11px] font-medium text-slate-400 hover:text-primary transition-colors"
          >
            ← Back to calendar
          </button>
        </div>
      )}

      {/* ── View Switcher: DAYS (Standard DayPicker) ── */}
      {view === "days" && (
        <DayPicker
          showOutsideDays={showOutsideDays}
          captionLayout="buttons"
          month={month}
          onMonthChange={setMonth}
          className="p-0 select-none"
          classNames={{
            months:              "flex flex-row gap-6",
            month:               "flex flex-col gap-2",
            caption:             "relative flex items-center justify-between h-9 mb-1 px-1",
            caption_label:       "hidden",
            nav:                 "flex items-center gap-1",
            nav_button:          cn(
              "h-7 w-7 rounded-lg border border-slate-200 bg-white",
              "flex items-center justify-center transition-colors",
              "hover:bg-slate-50 text-slate-500 hover:text-slate-800"
            ),
            nav_button_previous: "left-0",
            nav_button_next:     "right-0",
            table:               "w-full border-collapse mt-1",
            head_row:            "flex justify-between",
            head_cell:           "w-9 text-center text-[0.75rem] font-medium text-slate-400",
            row:                 "flex w-full mt-1 justify-between",
            cell:                cn(
              "relative h-9 w-9 p-0 text-center text-sm flex items-center justify-center",
              "focus-within:relative focus-within:z-20"
            ),
            day:                 cn(
              "h-8 w-8 p-0 font-normal rounded-lg text-slate-700 flex items-center justify-center",
              "hover:bg-slate-100 hover:text-slate-900 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/30"
            ),
            day_selected:        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-semibold",
            day_today:           "ring-1 ring-primary/30 font-semibold text-primary",
            day_outside:         "text-slate-300 opacity-50",
            day_disabled:        "text-slate-300 opacity-40 cursor-not-allowed hover:bg-transparent",
            day_hidden:          "invisible",
            ...classNames,
          }}
          components={{
            IconLeft:  () => <ChevronLeft  className="h-4 w-4 text-slate-600" />,
            IconRight: () => <ChevronRight className="h-4 w-4 text-slate-600" />,
            Caption:   ({ displayMonth }) => (
              <div className="flex items-center justify-between w-full px-1">
                <button
                  type="button"
                  onClick={openYearsView}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 border border-slate-200/60"
                >
                  <span>{MONTH_NAMES[displayMonth.getMonth()]} {displayMonth.getFullYear()}</span>
                  <span className="text-[10px] text-slate-400">▾</span>
                </button>
              </div>
            ),
          }}
          {...props}
        />
      )}
    </div>
  );
}

