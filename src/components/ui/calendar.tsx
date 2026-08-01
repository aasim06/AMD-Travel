"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function CalendarCaption({ displayMonth, onMonthChange }: {
  displayMonth: Date;
  onMonthChange: (month: Date) => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 120 }, (_, i) => currentYear - i);

  return (
    <div className="flex items-center justify-center gap-1.5 h-9 px-8">
      <select
        value={displayMonth.getMonth()}
        onChange={e => {
          const d = new Date(displayMonth);
          d.setMonth(Number(e.target.value));
          onMonthChange(d);
        }}
        className="text-sm font-semibold text-slate-800 bg-transparent border-0 outline-none cursor-pointer hover:text-primary transition-colors appearance-none pr-1"
      >
        {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
      </select>
      <select
        value={displayMonth.getFullYear()}
        onChange={e => {
          const d = new Date(displayMonth);
          d.setFullYear(Number(e.target.value));
          onMonthChange(d);
        }}
        className="text-sm font-semibold text-slate-800 bg-transparent border-0 outline-none cursor-pointer hover:text-primary transition-colors appearance-none"
      >
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(
    (props as { defaultMonth?: Date }).defaultMonth ??
    (props as { selected?: Date }).selected instanceof Date
      ? ((props as { selected?: Date }).selected as Date)
      : new Date()
  );

  React.useEffect(() => {
    const sel = (props as { selected?: Date }).selected;
    if (sel instanceof Date) setMonth(sel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(props as { selected?: Date }).selected]);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout="buttons"
      month={month}
      onMonthChange={setMonth}
      className={cn("p-3 select-none", className)}
      classNames={{
        months:              "flex flex-row gap-6",
        month:               "flex flex-col gap-3",
        caption:             "relative flex items-center justify-center h-9",
        caption_label:       "hidden",
        nav:                 "flex items-center gap-1",
        nav_button:          cn(
          "absolute h-7 w-7 rounded-lg border border-slate-200 bg-white",
          "flex items-center justify-center transition-colors",
          "hover:bg-slate-50 text-slate-500 hover:text-slate-800"
        ),
        nav_button_previous: "left-0",
        nav_button_next:     "right-0",
        table:               "w-full border-collapse mt-1",
        head_row:            "flex",
        head_cell:           "w-9 text-center text-[0.75rem] font-medium text-slate-400",
        row:                 "flex w-full mt-1",
        cell:                cn(
          "relative h-9 w-9 p-0 text-center text-sm",
          "focus-within:relative focus-within:z-20"
        ),
        day:                 cn(
          "h-9 w-9 p-0 font-normal rounded-lg text-slate-700",
          "hover:bg-slate-100 hover:text-slate-900 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary/30"
        ),
        day_selected:        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today:           "ring-1 ring-primary/30 font-semibold",
        day_outside:         "text-slate-300 opacity-50",
        day_disabled:        "text-slate-300 opacity-40 cursor-not-allowed hover:bg-transparent",
        day_hidden:          "invisible",
        ...classNames,
      }}
      components={{
        IconLeft:  () => <ChevronLeft  className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
        Caption:   ({ displayMonth }) => (
          <CalendarCaption displayMonth={displayMonth} onMonthChange={setMonth} />
        ),
      }}
      {...props}
    />
  );
}
