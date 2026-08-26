"use client";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

interface Option {
  value: string;
  label: string;
}

const timezoneOptions: Option[] = [
  { value: "Asia/Karachi", label: "(GMT+05:00) Islamabad, Karachi" },
  { value: "Europe/London", label: "(GMT+00:00) London" },
  { value: "America/New_York", label: "(GMT-05:00) Eastern Time (US & Canada)" },
  { value: "Asia/Dubai", label: "(GMT+04:00) Abu Dhabi, Muscat" },
  { value: "Asia/Riyadh", label: "(GMT+03:00) Riyadh" },
];

const currencyOptions: Option[] = [
  { value: "PKR", label: "PKR (₨) - Pakistani Rupee" },
  { value: "USD", label: "USD ($) - US Dollar" },
  { value: "AED", label: "AED (AED) - UAE Dirham" },
  { value: "SAR", label: "SAR (SAR) - Saudi Riyal" },
  { value: "EUR", label: "EUR (€) - Euro" },
  { value: "GBP", label: "GBP (£) - British Pound" },
];

function CustomSelect({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="dropdown-toggle h-11 w-full inline-flex items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500 cursor-pointer"
      >
        <span className="truncate">{selectedOption.label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-brand-500" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="w-full max-h-60 overflow-y-auto p-1.5 shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <DropdownItem
              key={option.value}
              onItemClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-left font-medium transition-colors cursor-pointer ${
                isSelected
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
              }`}
            >
              <span>{option.label}</span>
              {isSelected && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-brand-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </DropdownItem>
          );
        })}
      </Dropdown>
    </div>
  );
}

export default function SettingsForm() {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [backupDownloaded, setBackupDownloaded] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  // Form State
  const [timezone, setTimezone] = useState("Asia/Karachi");
  const [currency, setCurrency] = useState("PKR");

  // Profit Markup State (Live Supabase DB Sync)
  const [markupType, setMarkupType] = useState<"PERCENTAGE" | "FLAT">("PERCENTAGE");
  const [markupValue, setMarkupValue] = useState<number>(5);

  // Load Markup settings from Supabase on page load
  React.useEffect(() => {
    async function loadMarkupSettings() {
      try {
        const res = await fetch("/api/admin/markup");
        const json = await res.json();
        if (json?.data) {
          if (json.data.markupType) setMarkupType(json.data.markupType);
          if (typeof json.data.markupValue === "number") setMarkupValue(json.data.markupValue);
        }
      } catch (err) {
        console.error("Failed to load markup settings:", err);
      }
    }
    loadMarkupSettings();
  }, []);

  // Notification Toggles
  const [emailNotifEnabled, setEmailNotifEnabled] = useState(true);
  const [whatsappNotifEnabled, setWhatsappNotifEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await fetch("/api/admin/markup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markupType,
          markupValue,
        }),
      });

      setIsSaving(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to save markup settings:", err);
      setIsSaving(false);
    }
  };

  const handleDownloadBackup = () => {
    const backupData = {
      agency: "AMD Global Travel",
      exportDate: new Date().toISOString(),
      version: "2.4.0",
      settings: {
        timezone,
        currency,
        emailNotifEnabled,
        whatsappNotifEnabled,
        maintenanceMode,
      },
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `amd_system_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setBackupDownloaded(true);
    setTimeout(() => setBackupDownloaded(false), 3000);
  };

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {/* 1. General Agency & Platform Details */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-bold text-sm">
            ⚙️
          </span>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            General Agency &amp; Platform Profile
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Agency / Platform Name
            </label>
            <input
              type="text"
              defaultValue="AMD Global Travel"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Company Tax ID / NTN Number
            </label>
            <input
              type="text"
              defaultValue="NTN-8291049-7"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90 font-mono"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Support Email Address
            </label>
            <input
              type="email"
              defaultValue="support@amdglobaltravel.com"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Helpline Phone Number
            </label>
            <input
              type="text"
              defaultValue="+92 300 0000000"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Default System Timezone
            </label>
            <CustomSelect
              options={timezoneOptions}
              value={timezone}
              onChange={setTimezone}
            />
          </div>
        </div>
      </div>

      {/* 2. Currency, Taxes & Convenience Fees */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400 font-bold text-sm">
            💰
          </span>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Currency, Taxes &amp; Convenience Charges
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Default Display Currency
            </label>
            <CustomSelect
              options={currencyOptions}
              value={currency}
              onChange={setCurrency}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Default Service / Booking Tax (%)
            </label>
            <div className="relative">
              <input
                type="number"
                defaultValue="2.5"
                step="0.1"
                className="w-full rounded-lg border border-gray-300 bg-transparent pl-4 pr-10 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 LIVE Flight Profit Markup & Commission Settings (Supabase DB Sync) */}
      <div className="rounded-2xl border border-brand-200 bg-brand-50/20 p-5 dark:border-brand-800/40 dark:bg-brand-500/[0.03] sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-sm shadow-theme-xs">
              📈
            </span>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Flight Profit Markup &amp; Commission Settings
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Live Supabase DB Sync — Profit margin automatically added to all website flight search fares.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">
            🟢 Active in Database
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200">
              Profit Markup Calculation Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMarkupType("PERCENTAGE")}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 px-3 text-sm font-semibold transition-all cursor-pointer ${
                  markupType === "PERCENTAGE"
                    ? "border-brand-500 bg-brand-500 text-white shadow-theme-xs"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                }`}
              >
                <span>% Percentage</span>
              </button>

              <button
                type="button"
                onClick={() => setMarkupType("FLAT")}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 px-3 text-sm font-semibold transition-all cursor-pointer ${
                  markupType === "FLAT"
                    ? "border-brand-500 bg-brand-500 text-white shadow-theme-xs"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                }`}
              >
                <span>$ Flat Fee</span>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200">
              {markupType === "PERCENTAGE" ? "Profit Margin Percentage (%)" : "Flat Profit Margin Amount ($)"}
            </label>
            <div className="relative">
              <input
                type="number"
                value={markupValue}
                onChange={(e) => setMarkupValue(parseFloat(e.target.value) || 0)}
                step={markupType === "PERCENTAGE" ? "0.5" : "1"}
                className="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-900 pl-4 pr-12 py-2.5 text-base font-bold text-gray-900 dark:text-white outline-none focus:border-brand-500 shadow-theme-xs"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-600 dark:text-brand-400">
                {markupType === "PERCENTAGE" ? "% Profit" : "$ USD"}
              </span>
            </div>
          </div>

          <div className="sm:col-span-2 rounded-xl bg-white dark:bg-gray-900/80 p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
              <span><strong>Live Example:</strong> If Amadeus Base Fare is <strong>$400</strong>:</span>
              <span className="font-bold text-brand-600 dark:text-brand-400 text-sm">
                Customer Price: ${markupType === "PERCENTAGE" ? Math.round(400 * (1 + markupValue / 100)) : 400 + markupValue}
                {" "}
                <span className="text-gray-400 font-normal">
                  (Includes +${markupType === "PERCENTAGE" ? Math.round(400 * (markupValue / 100)) : markupValue} Agency Profit)
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Email Notification Gateway (SMTP Server Setup) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-bold text-sm">
              📧
            </span>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Email Notification Gateway (SMTP Setup)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automated e-ticket confirmation and payment receipts sent to travelers.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                emailNotifEnabled
                  ? "bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {emailNotifEnabled ? "ON" : "OFF"}
            </span>

            <button
              type="button"
              role="switch"
              aria-checked={emailNotifEnabled}
              onClick={() => setEmailNotifEnabled((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                emailNotifEnabled ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ${
                  emailNotifEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {emailNotifEnabled && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                SMTP Server Host
              </label>
              <input
                type="text"
                defaultValue="smtp.gmail.com"
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90 font-mono"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                SMTP Port (SSL / TLS)
              </label>
              <input
                type="text"
                defaultValue="587"
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90 font-mono"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                SMTP Username / Mailer Address
              </label>
              <input
                type="email"
                defaultValue="notifications@amdglobaltravel.com"
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                SMTP Password / App Key
              </label>
              <input
                type="password"
                defaultValue="****************"
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90 font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. WhatsApp Instant Notification Gateway (Twilio / Business API) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold text-sm">
              💬
            </span>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                WhatsApp Notification Gateway (Twilio / UltraMsg)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Send instant ticket PDFs, PNR alerts, and flight updates directly to traveler WhatsApp.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                whatsappNotifEnabled
                  ? "bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {whatsappNotifEnabled ? "ON" : "OFF"}
            </span>

            <button
              type="button"
              role="switch"
              aria-checked={whatsappNotifEnabled}
              onClick={() => setWhatsappNotifEnabled((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                whatsappNotifEnabled ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ${
                  whatsappNotifEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {whatsappNotifEnabled && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                WhatsApp Account SID / Instance ID
              </label>
              <input
                type="text"
                defaultValue="instance892104"
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90 font-mono"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                WhatsApp API Auth Token
              </label>
              <input
                type="password"
                defaultValue="********************************"
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Official WhatsApp Sender Number
              </label>
              <input
                type="text"
                defaultValue="+92 300 0000000"
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90 font-mono"
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Travelers will receive automated ticket PNR &amp; E-Ticket PDF messages from this WhatsApp number.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 5. GDS Flight & Payment API Integrations */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 font-bold text-sm">
            🔌
          </span>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            GDS Flight APIs &amp; Payment Credentials
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amadeus GDS API Key
            </label>
            <input
              type="text"
              defaultValue="amadeus_live_pk_829104829104"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90 font-mono"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amadeus API Secret
            </label>
            <input
              type="password"
              defaultValue="*************************"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90 font-mono"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              SerpAPI Key (Google Flights Search)
            </label>
            <input
              type="password"
              defaultValue="serp_live_88492019482910"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90 font-mono"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Stripe Live Secret Key
            </label>
            <input
              type="password"
              defaultValue="sk_live_1234567890abcdef"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white/90 font-mono"
            />
          </div>
        </div>
      </div>

      {/* 6. Security, Maintenance & Database Backup */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 mb-20">
        <div className="flex items-center gap-2 mb-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 font-bold text-sm">
            🛡️
          </span>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Security, Maintenance &amp; Database Backup
          </h3>
        </div>

        <div className="flex flex-col gap-5">
          {/* Maintenance Mode Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
            <div>
              <h4 className="text-sm font-bold text-gray-800 dark:text-white">
                Maintenance Mode
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Temporarily disable public flight search &amp; booking while updating system.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={maintenanceMode}
              onClick={() => setMaintenanceMode((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                maintenanceMode ? "bg-warning-500" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ${
                  maintenanceMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 2FA Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
            <div>
              <h4 className="text-sm font-bold text-gray-800 dark:text-white">
                Two-Factor Authentication (2FA) for Admins
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Require OTP code verification on admin portal login.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={twoFactorAuth}
              onClick={() => setTwoFactorAuth((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                twoFactorAuth ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ${
                  twoFactorAuth ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Maintenance Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              {backupDownloaded ? "✓ Backup Downloaded!" : "Download DB Backup (.json)"}
            </button>

            <button
              type="button"
              onClick={handleClearCache}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4 text-warning-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              {cacheCleared ? "✓ Cache Cleared!" : "Clear System Cache"}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:left-[290px] border-t border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex items-center justify-end gap-4 max-w-screen-2xl mx-auto">
          {showSuccess && (
            <span className="inline-flex items-center text-sm font-medium text-success-600 dark:text-success-500 transition-opacity duration-300">
              <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              System &amp; Gateways Settings saved!
            </span>
          )}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200 transition-colors duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
