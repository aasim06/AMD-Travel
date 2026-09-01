"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Smartphone,
  Send,
  LogOut,
  ShieldCheck,
  Zap,
  Info,
  Check,
} from "lucide-react";

type WhatsAppStatus = "connecting" | "qr_pending" | "connected" | "disconnected";

interface GatewayState {
  status: WhatsAppStatus;
  qrCodeDataUrl: string | null;
  user: { id?: string; name?: string } | null;
  error: string | null;
  timestamp: number;
}

export default function WhatsAppAdminPage() {
  const [gateway, setGateway] = useState<GatewayState | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  const isMountedRef = useRef(true);

  // Poll status from API route
  const fetchStatus = useCallback(async (isInitial = false) => {
    try {
      const res = await fetch("/api/whatsapp/status", { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/admin/signin";
        return;
      }
      const data = await res.json();
      if (isMountedRef.current) {
        if (data.success) {
          setGateway({
            status: data.status,
            qrCodeDataUrl: data.qrCodeDataUrl,
            user: data.user,
            error: data.error,
            timestamp: data.timestamp,
          });
          setLastSyncTime(new Date().toLocaleTimeString());
        }
      }
    } catch (err) {
      console.error("Failed to poll WhatsApp status:", err);
    } finally {
      if (isInitial && isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchStatus(true);

    // Poll every 3 seconds
    const interval = setInterval(() => {
      fetchStatus(false);
    }, 3000);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchStatus]);

  // Handle reconnect / reset session
  const handleAction = async (action: "reconnect" | "clear_session") => {
    if (action === "clear_session" && !confirm("Are you sure you want to log out and clear the active WhatsApp session?")) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/whatsapp/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchStatus(false);
      }
    } catch (err) {
      console.error("Action error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Send Test Message
  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) return;

    setTestSending(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/whatsapp/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_message",
          phone: testPhone,
          text: testMessage || "🔔 *AMD Global Travel*: Test WhatsApp message dispatched from your Admin Control Panel!",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setTestResult({ success: true, msg: "Message dispatched successfully!" });
        setTestMessage("");
      } else {
        setTestResult({ success: false, msg: json.error || "Failed to send message" });
      }
    } catch (err: any) {
      setTestResult({ success: false, msg: err?.message || "Network error" });
    } finally {
      setTestSending(false);
    }
  };

  const currentStatus = gateway?.status || "connecting";

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="WhatsApp Gateway" />

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Smartphone className="h-5 w-5" />
            </span>
            WhatsApp Baileys Gateway
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Scan QR code to link your official WhatsApp device for automated e-vouchers, flight tickets, and notifications.
          </p>
        </div>

        {/* Live Indicator & Actions */}
        <div className="flex items-center gap-2">
          {lastSyncTime && (
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mr-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Polling (3s) • {lastSyncTime}
            </span>
          )}

          <button
            onClick={() => fetchStatus(false)}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors shadow-xs cursor-pointer"
            title="Refresh connection status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? "animate-spin text-brand-500" : ""}`} />
            <span>Sync Status</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="min-h-[420px] flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Connecting to WhatsApp Baileys Socket...
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main QR / Status Panel */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm flex flex-col justify-between">
              <div>
                {/* Status Bar */}
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Connection State</span>
                  </div>

                  {currentStatus === "connected" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                      Connected & Ready
                    </span>
                  )}

                  {currentStatus === "qr_pending" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                      <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                      QR Code Ready to Scan
                    </span>
                  )}

                  {currentStatus === "connecting" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                      <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                      Initializing Socket...
                    </span>
                  )}

                  {currentStatus === "disconnected" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                      <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                      Offline / Disconnected
                    </span>
                  )}
                </div>

                {/* 1. QR PENDING STATE */}
                {currentStatus === "qr_pending" && (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="relative p-4 bg-white rounded-2xl border border-gray-200 shadow-lg dark:border-gray-700 mb-6 group">
                      {gateway?.qrCodeDataUrl ? (
                        <img
                          src={gateway.qrCodeDataUrl}
                          alt="WhatsApp Baileys QR Code"
                          className="w-64 h-64 md:w-72 md:h-72 rounded-lg object-contain"
                        />
                      ) : (
                        <div className="w-64 h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <QrCode className="w-16 h-16 text-gray-300 animate-pulse" />
                        </div>
                      )}
                      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-3 py-0.5 rounded-full shadow">
                        Auto-refreshes periodically
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Scan with your WhatsApp Phone
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
                      Open WhatsApp on your phone, go to <strong>Linked Devices</strong>, and point your camera at this QR code.
                    </p>

                    {/* Instruction Steps */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left text-xs text-gray-600 dark:text-gray-300">
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Step 1</span>
                        Open WhatsApp on your phone
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Step 2</span>
                        Go to Settings ➔ Linked Devices ➔ Link a Device
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Step 3</span>
                        Point camera to scan the QR code above
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CONNECTED STATE */}
                {currentStatus === "connected" && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-5 animate-bounce-subtle">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      WhatsApp Gateway is Live & Connected!
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
                      Your self-hosted Baileys gateway is actively running in-memory. Automated customer receipts, dynamic car vouchers, Umrah package cards, and visa updates will be dispatched automatically.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-left text-xs mb-6">
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                        <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">Instant Dynamic Voucher PNGs</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">0ms Server Pre-warm Ready</span>
                      </div>
                    </div>

                    {/* Session user info if available */}
                    {gateway?.user && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-mono text-gray-700 dark:text-gray-300 mb-2">
                        <span>Connected JID: {gateway.user.id || "Active Session"}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. CONNECTING / INITIALIZING STATE */}
                {currentStatus === "connecting" && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Starting Baileys Socket Connection...
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                      Initializing multi-file auth credentials and generating WebSocket session. If this takes longer than 10 seconds, click Reconnect below.
                    </p>
                  </div>
                )}

                {/* 4. DISCONNECTED STATE */}
                {currentStatus === "disconnected" && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      WhatsApp Gateway Disconnected
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                      {gateway?.error ? `Reason: ${gateway.error}` : "No active session detected. Click below to initialize socket and generate a new QR code."}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Actions Toolbar */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction("reconnect")}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? "animate-spin" : ""}`} />
                    <span>Restart / Reconnect</span>
                  </button>

                  <button
                    onClick={() => handleAction("clear_session")}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Reset & Clear Session</span>
                  </button>
                </div>

                <div className="text-[11px] text-gray-400 dark:text-gray-500">
                  AMD Self-Hosted Baileys Gateway v7
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel: Send Live Test Message & Info */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
            {/* Live Message Dispatcher Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                <Send className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Send Test Notification
                </h3>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Verify that your WhatsApp connection is properly sending messages in real-time.
              </p>

              <form onSubmit={handleSendTestMessage} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number (with Country Code)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +923060112606 or +4917972968560"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message Body (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter custom test message..."
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={testSending || currentStatus !== "connected"}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testSending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch WhatsApp Test</span>
                    </>
                  )}
                </button>
              </form>

              {/* Result Notice */}
              {testResult && (
                <div
                  className={`mt-4 p-3 rounded-xl text-xs flex items-start gap-2 ${
                    testResult.success
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      : "bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                  }`}
                >
                  {testResult.success ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.msg}</span>
                </div>
              )}
            </div>

            {/* Gateway Information Card */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5 dark:border-gray-800 dark:bg-gray-900/50">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-gray-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  How Notifications Work
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <span><strong>Flight Bookings:</strong> PNR code, route, airline, and departure details are sent automatically upon confirmation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <span><strong>Car Rentals:</strong> A high-resolution graphic voucher card PNG with vehicle photo is rendered on-the-fly and dispatched.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <span><strong>Umrah Packages:</strong> A customized pilgrimage voucher card with hotel nights and package details is delivered.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <span><strong>Visa Applications:</strong> Instant application receipt with reference number sent to the applicant.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
