"use client";

import { useState } from "react";

// Accessory: enter a Meta Phone Number ID, check its live status, and (if
// unverified) request + submit a verification code — straight against the
// Meta Graph API (/{id}/request_code, /verify_code, and a plain GET status).
export default function MetaPhoneVerify() {
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [codeMethod, setCodeMethod] = useState("SMS");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  async function checkStatus() {
    if (!phoneNumberId.trim()) return setError("Enter a Phone Number ID first");
    setBusy("status");
    setError("");
    try {
      const res = await fetch(`/api/meta/phone?id=${encodeURIComponent(phoneNumberId.trim())}`);
      const data = await res.json();
      if (res.ok) setStatus(data.status);
      else setError(data.error || "Failed to fetch status");
    } catch {
      setError("Network error");
    }
    setBusy("");
  }

  async function requestCode() {
    if (!phoneNumberId.trim()) return setError("Enter a Phone Number ID first");
    setBusy("request");
    setError("");
    setCodeSent(false);
    try {
      const res = await fetch("/api/meta/phone/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumberId: phoneNumberId.trim(), codeMethod }),
      });
      const data = await res.json();
      if (res.ok) setCodeSent(true);
      else setError(data.error || "Failed to send code");
    } catch {
      setError("Network error");
    }
    setBusy("");
  }

  async function verifyCode() {
    if (!code.trim()) return setError("Enter the code Meta sent you");
    setBusy("verify");
    setError("");
    try {
      const res = await fetch("/api/meta/phone/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumberId: phoneNumberId.trim(), code: code.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(data.status);
        setCode("");
        setCodeSent(false);
      } else {
        setError(data.error || "Verification failed");
      }
    } catch {
      setError("Network error");
    }
    setBusy("");
  }

  const verified = status?.code_verification_status === "VERIFIED";

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--brand-dark)] text-xs font-bold text-white">
          ✆
        </span>
        <h2 className="font-medium">Meta phone number verification</h2>
      </div>

      <div className="space-y-2">
        <label className="block text-sm">
          <span className="text-slate-500">Phone Number ID</span>
          <input
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
            placeholder="e.g. 1162603176936610 (from Meta > WhatsApp > API Setup)"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={checkStatus}
            disabled={busy === "status"}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {busy === "status" ? "Checking…" : "Check status"}
          </button>

          {!verified && (
            <>
              <select
                value={codeMethod}
                onChange={(e) => setCodeMethod(e.target.value)}
                className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              >
                <option value="SMS">SMS</option>
                <option value="VOICE">Voice call</option>
              </select>
              <button
                type="button"
                onClick={requestCode}
                disabled={busy === "request"}
                className="rounded-lg bg-[var(--brand-dark)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {busy === "request" ? "Sending…" : "Send verification code"}
              </button>
            </>
          )}
        </div>

        {codeSent && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter the code Meta sent you"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={verifyCode}
              disabled={busy === "verify" || !code.trim()}
              className="shrink-0 rounded-lg bg-[var(--brand-dark)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy === "verify" ? "Verifying…" : "Verify"}
            </button>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {status && (
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <p>
              <span className="text-slate-500">Number: </span>
              <span className="font-medium">{status.display_phone_number || "—"}</span>
            </p>
            <p>
              <span className="text-slate-500">Verified name: </span>
              <span className="font-medium">{status.verified_name || "—"}</span>
            </p>
            <p>
              <span className="text-slate-500">Verification: </span>
              <span
                className={`font-medium ${verified ? "text-green-600" : "text-amber-700"}`}
              >
                {status.code_verification_status || "—"}
              </span>
            </p>
            <p>
              <span className="text-slate-500">Quality rating: </span>
              <span className="font-medium">{status.quality_rating || "—"}</span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
