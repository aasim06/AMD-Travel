"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

const PROMPTS = [
  "Flights to Jeddah...",
  "Best 10-Day Umrah Package...",
  "Rent an SUV in Frankfurt...",
  "Cheapest Flight to Miami...",
  "Dubai Visit Visa Requirements...",
  "Flights from Lahore to Dubai...",
];

export function FloatingAiTypewriterPill() {
  const [promptIdx, setPromptIdx] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullText = PROMPTS[promptIdx];
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing phase
      if (displayText.length < currentFullText.length) {
        timer = setTimeout(() => {
          setDisplayText(currentFullText.slice(0, displayText.length + 1));
        }, 75);
      } else {
        // Pause at end of text before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      // Deleting phase
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentFullText.slice(0, displayText.length - 1));
        }, 40);
      } else {
        // Move to next prompt
        setIsDeleting(false);
        setPromptIdx((prev) => (prev + 1) % PROMPTS.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, promptIdx]);

  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-ask-ai-drawer"));
    }
  };

  return (
    <div
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-40 hidden sm:flex items-center gap-3 px-5 py-3 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:border-[#FF8B3D]/60 hover:shadow-2xl transition-all duration-300 cursor-pointer group select-none"
    >
      {/* Animated AI Sparkles Icon */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF5722] to-[#FF8B3D] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
        <Sparkles className="w-4 h-4 animate-pulse" />
      </div>

      {/* Typewriter Text Display */}
      <div className="flex items-center text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-outfit min-w-[210px]">
        <span>{displayText}</span>
        <span className="inline-block w-1.5 h-4 ml-0.5 bg-[#FF8B3D] animate-pulse" />
      </div>

      {/* Hover Arrow Indicator */}
      <div className="pl-1 text-slate-400 group-hover:text-[#FF8B3D] transition-colors">
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
