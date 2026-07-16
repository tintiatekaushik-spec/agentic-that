"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddContact() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", tags: "", notes: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set(k) {
    return (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ name: "", phone: "", tags: "", notes: "" });
      setOpen(false);
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Failed to add");
    }
    setBusy(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-[var(--brand-dark)] px-3 py-2 text-sm font-medium text-white"
      >
        + Add contact
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-4 shadow-lg">
        <h2 className="font-semibold">New contact</h2>
        <input value={form.name} onChange={set("name")} placeholder="Name" required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input value={form.phone} onChange={set("phone")} placeholder="Phone (e.g. +9198…)" required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input value={form.tags} onChange={set("tags")} placeholder="Tags (comma separated)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <textarea value={form.notes} onChange={set("notes")} placeholder="Notes" rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-slate-600">
            Cancel
          </button>
          <button type="submit" disabled={busy}
            className="rounded-lg bg-[var(--brand-dark)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
