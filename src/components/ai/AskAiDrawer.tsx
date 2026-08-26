"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  ArrowRight,
  Bot,
  User,
} from "lucide-react";

interface ActionCard {
  title: string;
  type: "umrah" | "car" | "flight" | "visa";
  price: string;
  details: string;
  actionUrl: string;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  cards?: ActionCard[];
  timestamp: string;
}

interface AskAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_PROMPTS = [
  { text: "Best Umrah Packages with 5★ Hotel" },
  { text: "Cheapest Flights from Lahore to Jeddah" },
  { text: "Rent an SUV at Frankfurt Airport" },
  { text: "Dubai Tourist Visa Requirements" },
];

export default function AskAiDrawer({ isOpen, onClose }: AskAiDrawerProps) {
  const router = useRouter();
  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "Aap ka Khushamdeed! Main AMD Global Travel AI Assistant hoon. Aap Flights, Umrah Packages, Rent a Car ya Visas ke baaray me Roman Urdu ya English me kuch bhi pooch saktay hain!",
      cards: [
        {
          title: "All-Inclusive Umrah Packages",
          type: "umrah",
          price: "From $1,299",
          details: "Return Flights + Makkah & Madinah Hotels + Transfers",
          actionUrl: "/umrah-packages",
        },
        {
          title: "Rent a Car Fleet",
          type: "car",
          price: "From $45/day",
          details: "SUV & Luxury Sedans with Full Insurance",
          actionUrl: "/cars",
        },
      ],
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (customQuery?: string) => {
    const textToSend = (customQuery || inputMsg).trim();
    if (!textToSend || loading) return;

    const userMsgObj: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setInputMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-6).map((m) => ({ role: m.sender, content: m.text })),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.data) {
        const aiMsgObj: Message = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: data.data.reply || "Shukriya! Main aap ki booking me madad kar sakta hoon.",
          cards: data.data.suggestedCards || [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsgObj]);
      } else {
        throw new Error("Failed response");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: "Mazaarat! Network Error. Lekin aap hamare Live Catalog me Umrah, Flights aur Cars explore kar sakte hain.",
          cards: [
            {
              title: "Explore Umrah Packages",
              type: "umrah",
              price: "Live Prices",
              details: "View active Umrah deals",
              actionUrl: "/umrah-packages",
            },
          ],
          timestamp: "Just now",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (url: string) => {
    onClose();
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex overflow-hidden">
      {/* Dark Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
      />

      {/* Kayak-Style Left Slide-Over Drawer (Responsive Light / Dark Mode) */}
      <div className="relative z-10 w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-left duration-300">

        {/* ── Top Header Bar ── */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-tr from-[#FF5722] to-[#FF8B3D] text-white shadow-lg shadow-[#FF5722]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold font-outfit text-base text-slate-900 dark:text-white tracking-tight">
                  AMD <span className="text-[#FF8B3D]">Global</span> AI
                </span>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-[#FF8B3D]/15 text-[#FF8B3D] border border-[#FF8B3D]/30">
                  AI Travel Assistant
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Ask AI
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Sample Prompt Chips ── */}
        <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-950/30 overflow-x-auto flex items-center gap-2 no-scrollbar">
          {SAMPLE_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p.text)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-[#FF8B3D]/15 hover:text-[#FF8B3D] border border-slate-200 dark:border-slate-700/60 hover:border-[#FF8B3D]/40 text-slate-700 dark:text-slate-300 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>{p.text}</span>
            </button>
          ))}
        </div>

        {/* ── Message Thread Container ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${msg.sender === "user"
                  ? "bg-[#FF8B3D] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-[#FF8B3D] border border-slate-200 dark:border-slate-700"
                  }`}
              >
                {msg.sender === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Bubble & Cards */}
              <div className={`space-y-3 max-w-[85%] ${msg.sender === "user" ? "items-end" : "items-start"}`}>

                {/* Bubble Text */}
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed font-medium shadow-xs ${msg.sender === "user"
                    ? "bg-gradient-to-tr from-[#FF5722] to-[#FF8B3D] text-white rounded-tr-xs"
                    : "bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs"
                    }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1.5 font-sans ${msg.sender === "user" ? "text-white/70 text-right" : "text-slate-400"
                      }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* Embedded Action Cards */}
                {msg.cards && msg.cards.length > 0 && (
                  <div className="space-y-2 pt-1 w-full">
                    {msg.cards.map((card, cIdx) => (
                      <div
                        key={cIdx}
                        onClick={() => handleCardClick(card.actionUrl)}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-[#FF8B3D]/50 hover:bg-[#FF8B3D]/5 transition-all cursor-pointer group shadow-sm flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF8B3D]/15 text-[#FF8B3D]">
                              {card.type}
                            </span>
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                              {card.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {card.details}
                          </p>
                        </div>

                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                          <span className="text-xs font-black text-[#FF8B3D]">
                            {card.price}
                          </span>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-white group-hover:text-[#FF8B3D] flex items-center gap-0.5">
                            View <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator Loading Dots */}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-[#FF8B3D] border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF8B3D] animate-ping" />
                <span>AI is searching travel catalog...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Box Footer ── */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              placeholder="Ask AI anything (e.g. Flight to Jeddah, Umrah package...)"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              disabled={loading}
              className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF8B3D]/50 focus:border-[#FF8B3D] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />

            <button
              type="submit"
              disabled={loading || !inputMsg.trim()}
              className="absolute right-2 p-2 rounded-xl bg-gradient-to-tr from-[#FF5722] to-[#FF8B3D] hover:opacity-90 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2">
            Powered by Google Gemini 1.5 Flash • AMD Global Travel
          </p>
        </div>

      </div>
    </div>
  );
}
