"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/format";

// Full contact directory, searchable — the "CRM" view: every contact in one
// place regardless of recent activity, unlike the windowed Eagle Eye feed.
export default function AllContactsCRM({ contacts }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      [c.name, c.phone, c.tags, c.last_message].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [contacts, query]);

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-medium">All contacts</h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
          {contacts.length}
        </span>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search name, phone, tag, or message…"
        className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
      />
      {filtered.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">No contacts match.</p>
      ) : (
        <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-100">
          {filtered.map((c) => (
            <li key={c.id}>
              <Link href={`/contacts/${c.id}`} className="block px-3 py-2 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.phone}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="text-xs text-slate-400">
                      {timeAgo(c.last_message_at || c.last_activity_at || c.created_at)}
                    </span>
                    {c.last_message_status === "failed" && (
                      <span className="text-[10px] text-red-500">send failed</span>
                    )}
                  </div>
                </div>
                {c.last_message && (
                  <p className="mt-1 truncate text-xs text-slate-500">
                    <span className="uppercase text-slate-400">
                      {c.last_message_direction === "out" ? "You: " : "Them: "}
                    </span>
                    {c.last_message}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
