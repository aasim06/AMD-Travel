"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, change, changeLabel, icon }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="font-heading text-2xl font-bold tracking-tight">{value}</p>
          </div>
          {icon && (
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="size-3.5 text-emerald-600" />
          ) : (
            <TrendingDown className="size-3.5 text-red-500" />
          )}
          <span
            className={cn(
              "text-xs font-semibold",
              isPositive ? "text-emerald-600" : "text-red-500"
            )}
          >
            {isPositive ? "+" : ""}
            {change}%
          </span>
          <span className="text-xs text-muted-foreground">{changeLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}
