"use client";

import { useEffect, useState, useRef } from "react";

interface TypewriterProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  deletingPauseDuration?: number;
  className?: string;
  cursorClassName?: string;
}

export function Typewriter({
  words,
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseDuration = 1800,
  deletingPauseDuration = 350,
  className = "",
  cursorClassName = "",
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Keep a stable list of words via ref
  const wordsRef = useRef(words);
  wordsRef.current = words;

  // Track words content change
  const wordsKey = words.join("|||");
  const prevKeyRef = useRef(wordsKey);

  useEffect(() => {
    if (prevKeyRef.current !== wordsKey) {
      prevKeyRef.current = wordsKey;
      setWordIdx(0);
      setDisplayText("");
      setIsDeleting(false);
    }
  }, [wordsKey]);

  useEffect(() => {
    const list = wordsRef.current;
    if (!list || list.length === 0) return;

    const currentWord = list[wordIdx % list.length] || "";

    const handleTyping = () => {
      if (!isDeleting) {
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        } else {
          setIsDeleting(true);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(currentWord.slice(0, displayText.length - 1));
        } else {
          setIsDeleting(false);
          setWordIdx((prev) => (prev + 1) % list.length);
        }
      }
    };

    let delay = typingSpeed;
    if (!isDeleting && displayText.length === currentWord.length) {
      delay = pauseDuration;
    } else if (isDeleting && displayText.length === 0) {
      delay = deletingPauseDuration;
    } else if (isDeleting) {
      delay = deletingSpeed;
    }

    const timer = setTimeout(handleTyping, delay);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, wordIdx, typingSpeed, deletingSpeed, pauseDuration, deletingPauseDuration]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{displayText || "\u00A0"}</span>
      <span
        className={`inline-block w-[3px] h-[0.85em] ml-1 bg-primary animate-pulse rounded-full ${cursorClassName}`}
        aria-hidden="true"
      />
    </span>
  );
}
