"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      // Use simple prev/next buttons — avoids the duplicate label+dropdown
      // bug that occurs with captionLayout="dropdown-buttons" in v8
      captionLayout="buttons"
      className={cn("p-3 select-none", className)}
      classNames={{
        months:              "flex flex-col gap-4",
        month:               "flex flex-col gap-3",
        caption:             "relative flex items-center justify-center h-9",
        caption_label:       "text-sm font-semibold text-slate-800 pointer-events-none",
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
        day_range_start:     "bg-primary text-primary-foreground rounded-l-lg rounded-r-none",
        day_range_end:       "bg-primary text-primary-foreground rounded-r-lg rounded-l-none",
        day_range_middle:    "bg-primary/10 text-primary rounded-none hover:bg-primary/20",
        day_today:           "ring-1 ring-primary/30 font-semibold",
        day_outside:         "text-slate-300 opacity-50",
        day_disabled:        "text-slate-300 opacity-40 cursor-not-allowed hover:bg-transparent",
        day_hidden:          "invisible",
        ...classNames,
      }}
      components={{
        IconLeft:  () => <ChevronLeft  className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
