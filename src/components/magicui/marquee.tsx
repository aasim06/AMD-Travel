import { cn } from "@/lib/utils";
import React from "react";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  style,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      style={{
        ["--duration" as any]: "25s",
        ["--gap" as any]: "1rem",
        ...style,
      }}
      className={cn(
        "group flex overflow-hidden p-2 [gap:var(--gap)]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
            "animate-marquee-reverse flex-row": !vertical && reverse,
            "animate-marquee flex-row": !vertical && !reverse,
            "animate-marquee-vertical flex-col": vertical,
            "group-hover:[animation-play-state:paused]": pauseOnHover,
          })}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
