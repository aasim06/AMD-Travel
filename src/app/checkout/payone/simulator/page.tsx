"use client";

export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Building2,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  CreditCard,
  Smartphone,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

function PayoneSimulatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const txid = searchParams.get("txid") || "PAYONE_TEST_" + Date.now();
  const ref = searchParams.get("ref") || "AMD-REF";
  const amount = searchParams.get("amount") || "149.00";
  const currency = searchParams.get("currency") || "EUR";
  const method = searchParams.get("method") || "sofort";
  const successUrl =
    searchParams.get("successUrl") ||
    `/checkout/payone/return?status=success&ref=${ref}&txid=${txid}&sandbox=true`;
  const errorUrl =
    searchParams.get("errorUrl") ||
    `/checkout/payone/return?status=error&ref=${ref}&txid=${txid}&sandbox=true`;

  const [simulating, setSimulating] = useState(false);
  const [selectedBank, setSelectedBank] = useState("Sparkasse Frankfurt (BLZ 50050201)");
  const [testPin, setTestPin] = useState("12345");
  const [testTan, setTestTan] = useState("987654");

  const methodNames: Record<string, string> = {
    sofort: "Sofort / Klarna (Direct Bank Transfer)",
    giropay: "Giropay (Sparkasse & German Checking Account)",
    sepa: "SEPA Direct Debit (Lastschrift)",
    card: "Credit Card (Visa / Mastercard 3D-Secure)",
  };

  async function handleAuthorizePayment() {
    setSimulating(true);

    try {
      // Trigger PAYONE callback in background to simulate real webhook
      const formData = new URLSearchParams();
      formData.append("txid", txid);
      formData.append("reference", ref);
      formData.append("txaction", "paid");
      formData.append("price", amount);
      formData.append("currency", currency);

      await fetch("/api/payment/payone/callback", {
        method: "POST",
        body: formData,
      }).catch(() => {});
    } catch {
      /* ignore */
    }

    // Small delay to simulate realistic German bank authorization
    setTimeout(() => {
      router.push(successUrl);
    }, 1200);
  }

  function handleCancelPayment() {
    router.push(errorUrl);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 py-8 px-4 flex flex-col items-center justify-center font-sans">
      {/* Test Mode Banner */}
      <div className="w-full max-w-lg mb-4 bg-amber-500 text-slate-950 px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-sm text-xs font-bold">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-slate-950" />
          <span>PAYONE Sandbox Test-Gateway · Mode: TEST</span>
        </div>
        <span className="bg-slate-950 text-amber-400 text-[10px] px-2 py-0.5 rounded font-mono uppercase">
          Simulated API
        </span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-300/80 overflow-hidden">
        {/* PAYONE Official Header */}
        <div className="bg-[#0b1b3d] text-white px-6 py-5 flex items-center justify-between border-b border-blue-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white font-sans">
                PAY<span className="text-sky-400">ONE</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-900/80 text-sky-200 font-semibold border border-sky-700">
                Payment Gateway
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Secure German Payment Processing (BS PAYONE GmbH)
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Total Amount</span>
            <span className="text-xl font-extrabold text-white">
              {currency} {Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Order Details Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-600">
          <div>
            <span className="text-slate-400">Merchant: </span>
            <span className="font-bold text-slate-800">AMD Global Travel</span>
          </div>
          <div>
            <span className="text-slate-400">Ref / PNR: </span>
            <span className="font-mono font-bold text-slate-800">{ref}</span>
          </div>
        </div>

        {/* Payment Simulation Form */}
        <div className="p-6 space-y-5">
          {/* Method Indicator */}
          <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                🇩🇪
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {methodNames[method] || "German Online Banking"}
                </p>
                <p className="text-[11px] text-slate-500">Official Test-Environment Dialog</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Test Mode Active
            </span>
          </div>

          {/* Form Fields Depending on Method */}
          {(method === "sofort" || method === "giropay") && (
            <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  German Bank (Bankleitzahl / BLZ)
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                >
                  <option value="Sparkasse Frankfurt (BLZ 50050201)">
                    Sparkasse Frankfurt (BLZ 50050201)
                  </option>
                  <option value="Deutsche Bank AG (BLZ 50070010)">
                    Deutsche Bank AG (BLZ 50070010)
                  </option>
                  <option value="Commerzbank Frankfurt (BLZ 50040000)">
                    Commerzbank Frankfurt (BLZ 50040000)
                  </option>
                  <option value="Postbank Frankfurt (BLZ 50010060)">
                    Postbank Frankfurt (BLZ 50010060)
                  </option>
                  <option value="Volksbank eG (BLZ 50190000)">Volksbank eG (BLZ 50190000)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Test Online PIN
                  </label>
                  <input
                    type="password"
                    value={testPin}
                    onChange={(e) => setTestPin(e.target.value)}
                    className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Test SMS / chipTAN
                  </label>
                  <input
                    type="text"
                    value={testTan}
                    onChange={(e) => setTestTan(e.target.value)}
                    className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {method === "sepa" && (
            <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Test German IBAN
                </label>
                <input
                  type="text"
                  defaultValue="DE89 5005 0201 0000 1234 56"
                  className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Test BIC / SWIFT
                </label>
                <input
                  type="text"
                  defaultValue="HELA DEF 1 FFM"
                  className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 italic">
                SEPA Mandatsreferenz: <span className="font-mono font-semibold">{ref}</span>
              </p>
            </div>
          )}

          {method === "card" && (
            <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Test Card Number
                </label>
                <input
                  type="text"
                  defaultValue="4000 0012 3456 7890 (PAYONE Test Visa)"
                  disabled
                  className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expiry</label>
                  <input
                    type="text"
                    defaultValue="12/28"
                    disabled
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">3DS Code</label>
                  <input
                    type="text"
                    defaultValue="123"
                    disabled
                    className="w-full font-mono text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Test Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleAuthorizePayment}
              disabled={simulating}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-75"
            >
              {simulating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Authorizing with Bank…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Simulate Successful Payment ({currency} {amount})
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancelPayment}
              disabled={simulating}
              className="w-full py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <XCircle className="h-3.5 w-3.5" />
              Simulate Cancel / Failed Payment
            </button>
          </div>

          {/* Footer Security Notice */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              BaFin ID: 101085
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-slate-400" />
              PCI-DSS Level 1
            </span>
            <span>·</span>
            <span>Frankfurt am Main, DE</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PayoneSimulatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <PayoneSimulatorContent />
    </Suspense>
  );
}
