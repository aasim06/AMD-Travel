"use client";

import { useEffect, useState } from "react";

interface TypewriterProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
  cursorClassName?: string;
}

export function Typewriter({
  words,
  typingSpeed = 90,
  deletingSpeed = 45,
  pauseDuration = 2200,
  className = "",
  cursorClassName = "",
}: TypewriterProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const wordsKey = JSON.stringify(words);

  // Reset state if words array changes
  useEffect(() => {
    setCurrentWordIndex(0);
    setCurrentText("");
    setIsDeleting(false);
  }, [wordsKey]);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const fullWord = words[currentWordIndex % words.length];

    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (currentText.length < fullWord.length) {
        timer = setTimeout(() => {
          setCurrentText(fullWord.slice(0, currentText.length + 1));
        }, typingSpeed);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText(fullWord.slice(0, currentText.length - 1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{currentText || "\u00A0"}</span>
      <span
        className={`inline-block w-[3px] h-[0.85em] ml-1 bg-[#FF6B35] animate-pulse rounded-full ${cursorClassName}`}
        aria-hidden="true"
      />
    </span>
  );
}
