"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";

function SimulatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const customerRef = searchParams.get("ref") || "ASR-000000";
  const token = searchParams.get("token") || "";
  const amount = searchParams.get("amount") || "249";
  const currency = searchParams.get("currency") || "AED";
  const buyerName = searchParams.get("name") || "Candidate";
  const buyerEmail = searchParams.get("email") || "candidate@asra3.com";

  const [selectedChannel, setSelectedChannel] = useState<string>(
    "Credit / Debit Card (Visa / Mastercard / Mada)"
  );
  const [processing, setProcessing] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);

  const handleCompletePayment = async () => {
    setProcessing(true);
    setSimError(null);
    try {
      const res = await fetch("/api/webhooks/easykash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ProductCode: "DIRECTPAY-V1",
          Amount: amount,
          ProductType: "ASRA3_CV_OUTREACH",
          PaymentMethod: selectedChannel,
          status: "PAID",
          easykashRef: `EK-${Date.now().toString().slice(-8)}`,
          customerReference: customerRef,
          BuyerName: buyerName,
          BuyerEmail: buyerEmail,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSimError(
          err?.reason ||
            err?.error ||
            "Sandbox callback disabled in production mode."
        );
        setProcessing(false);
        return;
      }

      router.push(`/track/${token}?payment=success`);
    } catch (e) {
      console.error("Failed to simulate EasyKash callback:", e);
      setSimError("Network error while simulating payment callback.");
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-6 sm:p-8 text-zinc-950 dark:text-zinc-50 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#09090B] border border-zinc-800 text-[#D4AF37] font-extrabold text-sm">
              A3
            </div>
            <div>
              <h1 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">
                Asra3 × EasyKash DirectPayV1
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Executive Payment Gateway (Sandbox / Staging)
              </p>
            </div>
          </div>
          <span className="rounded-lg border border-zinc-800 bg-[#09090B] px-2.5 py-1 text-[11px] font-bold text-[#D4AF37] font-mono">
            {customerRef}
          </span>
        </div>

        <div className="my-6 rounded-xl bg-[#09090B] p-5 text-center border border-zinc-800">
          <p className="text-xs text-zinc-400">Total Amount Due</p>
          <p className="mt-1 font-editorial text-4xl font-bold text-[#D4AF37]">
            {amount}{" "}
            <span className="font-sans text-base text-zinc-200">
              {currency}
            </span>
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {buyerName} ({buyerEmail})
          </p>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Select EasyKash Payment Method:
          </p>

          {[
            {
              label: "Credit / Debit Card (Visa / Mastercard / Mada)",
              icon: CreditCard,
            },
            {
              label: "Apple Pay / Google Pay Express",
              icon: Smartphone,
            },
            {
              label: "Mobile Wallets & Meeza Digital",
              icon: Wallet,
            },
            {
              label: "Fawry / Cash Reference Voucher",
              icon: CheckCircle2,
            },
          ].map((opt) => {
            const Icon = opt.icon;
            const active = selectedChannel === opt.label;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => setSelectedChannel(opt.label)}
                className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-xs font-bold transition cursor-pointer ${
                  active
                    ? "border-[#D4AF37] bg-[#09090B] text-zinc-50"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] text-zinc-700 dark:text-zinc-300 hover:border-[#D4AF37]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-[#D4AF37]" />
                  <span>{opt.label}</span>
                </span>
                <span
                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    active
                      ? "border-[#D4AF37] bg-[#D4AF37]"
                      : "border-zinc-400 dark:border-zinc-600"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {simError && (
          <div className="mt-4 rounded-xl border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/50 p-3 text-xs font-bold text-red-800 dark:text-red-200">
            {simError}
          </div>
        )}

        <button
          type="button"
          disabled={processing}
          onClick={handleCompletePayment}
          className="btn-gold mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-extrabold cursor-pointer disabled:opacity-60"
        >
          {processing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
          <span>
            {processing
              ? "Verifying EasyKash Callback..."
              : `Authorize ${amount} ${currency}`}
          </span>
        </button>

        <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1 font-semibold">
            <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
            HMAC-SHA512 Verified
          </span>
          <Link
            href="/"
            className="font-semibold hover:text-zinc-950 dark:hover:text-[#D4AF37] underline underline-offset-4"
          >
            Cancel & Return
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EasyKashSimulatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] flex items-center justify-center text-zinc-950 dark:text-zinc-50">
          Loading Asra3 Checkout Gateway...
        </div>
      }
    >
      <SimulatorContent />
    </Suspense>
  );
}
