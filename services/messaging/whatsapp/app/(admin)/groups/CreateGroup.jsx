"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateGroup() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    // WATI CRM is no longer used for this project — group creation always
    // goes through the local CRM now. Kept for reference (not deleted):
    // fetch(fromWati ? "/api/wati/groups" : "/api/groups", { ... })
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setName("");
      setOpen(false);
      router.push(`/groups/${data.id}`);
    } else {
      setError(data.error || "Failed");
      setBusy(false);
    }
  }

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-[var(--brand-dark)] px-3 py-2 text-sm font-medium text-white"
      >
        + New group
      </button>
    );

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-4 shadow-lg"
      >
        <h2 className="font-semibold">New group</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. WhatsApp Leads, Trial Users"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        {/* "Import WATI contacts into this group" checkbox removed — WATI CRM
            is no longer used for this project. The /api/wati/groups route it
            called is untouched, just unreferenced. */}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2 text-sm text-slate-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-[var(--brand-dark)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
