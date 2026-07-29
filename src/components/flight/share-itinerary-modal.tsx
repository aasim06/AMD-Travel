"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, Mail, MoreHorizontal } from "lucide-react";

// ─── Social icons (inline SVG to avoid extra deps) ────────────────────────────

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.857L.057 23.428a.75.75 0 0 0 .916.916l5.571-1.476A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.693 9.693 0 0 1-4.953-1.358l-.355-.211-3.683.975.991-3.585-.232-.369A9.693 9.693 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
    </svg>
  );
}

function MessengerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.149 0 11.5c0 3.606 1.794 6.823 4.608 8.945V24l4.207-2.311A13.2 13.2 0 0 0 12 22c6.627 0 12-4.925 12-11S18.627 0 12 0zm1.23 14.794-3.07-3.27-5.994 3.27L10.43 8.1l3.14 3.27L19.5 8.1l-6.27 6.694z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function ViberIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M11.4 0C6.39.05 2.67 1.4.9 4.9-.1 6.9-.3 9.1.3 11.4c.5 2 1.6 3.7 3.1 5.1v3.3c0 .4.5.6.8.3l2.9-2.9c1.4.4 2.9.5 4.3.3 4.7-.6 8.3-4.3 8.6-9 .4-5.5-3.6-8.5-8.6-8.5zm3.5 13.5c-.4.4-.9.7-1.4.7-.3 0-.5-.1-.8-.2-1.2-.5-2.3-1.2-3.2-2.1-.9-.9-1.6-2-2.1-3.2-.2-.5-.1-1 .2-1.4l.5-.5c.3-.3.8-.3 1.1 0l1.1 1.1c.3.3.3.8 0 1.1l-.3.3c.4.8.9 1.5 1.5 2.1.6.6 1.3 1.1 2.1 1.5l.3-.3c.3-.3.8-.3 1.1 0l1.1 1.1c.3.3.3.8 0 1.1l-.2.7z" />
    </svg>
  );
}

// ─── Share Modal ──────────────────────────────────────────────────────────────

interface ShareItineraryModalProps {
  url:     string;
  title?:  string;
  onClose: () => void;
}

export function ShareItineraryModal({ url, title = "Check out this flight itinerary!", onClose }: ShareItineraryModalProps) {
  const [visible, setVisible]   = useState(false);
  const [copied,  setCopied]    = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 250);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select input
    }
  }

  const encodedUrl   = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const SOCIALS = [
    {
      label: "WhatsApp",
      color: "bg-[#25D366] hover:bg-[#1ebe5d]",
      icon:  <WhatsAppIcon />,
      href:  `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: "Messenger",
      color: "bg-[#0084FF] hover:bg-[#0073e0]",
      icon:  <MessengerIcon />,
      href:  `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518`,
    },
    {
      label: "Telegram",
      color: "bg-[#26A5E4] hover:bg-[#1a96d4]",
      icon:  <TelegramIcon />,
      href:  `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "Viber",
      color: "bg-[#7360F2] hover:bg-[#6250e0]",
      icon:  <ViberIcon />,
      href:  `viber://forward?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: "Email",
      color: "bg-slate-600 hover:bg-slate-700",
      icon:  <Mail className="h-5 w-5" />,
      href:  `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A${encodedUrl}`,
    },
  ];

  async function handleMore() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* cancelled */ }
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-all duration-250 ${
        visible ? "bg-black/40 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 transition-all duration-250 ease-out ${
        visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
      }`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-base font-bold text-slate-900">Share this itinerary</p>
          <button type="button" onClick={handleClose}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Copy link */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 min-w-0">
            <span className="text-xs text-slate-500 truncate">{url}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all ${
              copied
                ? "bg-emerald-500"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Social share */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Share via</p>
        <div className="grid grid-cols-3 gap-3">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center gap-2 py-3 rounded-xl text-white text-[11px] font-semibold transition-all active:scale-95 ${s.color}`}
            >
              {s.icon}
              {s.label}
            </a>
          ))}

          {/* More options */}
          <button
            type="button"
            onClick={handleMore}
            className="flex flex-col items-center gap-2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold transition-all active:scale-95"
          >
            <MoreHorizontal className="h-5 w-5" />
            More
          </button>
        </div>
      </div>
    </div>
  );
}
