"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DEMO_EMAIL = "admin@demo.test";
const DEMO_PASSWORD = "password";

export default function WhatsAppLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/whatsapp/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }
    const data = await response.json().catch(() => ({}));
    setError(data.error || "Sign in failed");
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-xs font-medium text-slate-600">
        Email
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]" required />
      </label>
      <label className="block text-xs font-medium text-slate-600">
        Password
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]" required />
      </label>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <button type="submit" disabled={busy} className="w-full rounded-lg bg-[var(--brand-dark)] py-2 text-sm font-medium text-white disabled:opacity-50">
        {busy ? "Signing in..." : "Sign in to WhatsApp"}
      </button>
    </form>
  );
}
