"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/format";
import SendTemplateModal from "./SendTemplateModal";

// Full-page version of the dashboard's Responded / Not-responded lists, with
// per-contact actions: open the chat, or send an approved template right from
// the row (the only way to reach a "Not responded" contact outside the 24h
// window).
export default function ResponsesList({ contacts, emptyText, provider }) {
  const router = useRouter();
  const [modalContact, setModalContact] = useState(null);
  const [flash, setFlash] = useState("");

  if (contacts.length === 0) {
    return <p className="rounded-lg bg-white p-6 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">{emptyText}</p>;
  }

  return (
    <>
      {flash && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{flash}</p>}
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {contacts.map((c) => (
          <li key={c.id} className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{c.name}</p>
                <p className="text-xs text-slate-400">{c.phone}</p>
                {c.lastText && <p className="mt-1 truncate text-sm text-slate-500">{c.lastText}</p>}
              </div>
              <span className="shrink-0 text-xs text-slate-400">{timeAgo(c.lastAt)}</span>
            </div>
            <div className="mt-2 flex gap-2">
              <Link
                href={`/contacts/${c.id}`}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                💬 Chat
              </Link>
              <button
                onClick={() => setModalContact(c)}
                className="rounded-lg bg-[var(--brand-dark)] px-3 py-1.5 text-xs font-medium text-white"
              >
                📨 Send template
              </button>
            </div>
          </li>
        ))}
      </ul>

      {modalContact && (
        <SendTemplateModal
          contact={modalContact}
          provider={provider}
          onClose={() => setModalContact(null)}
          onSent={() => {
            setFlash(`Template sent to ${modalContact.name}.`);
            setModalContact(null);
            router.refresh();
            setTimeout(() => setFlash(""), 3000);
          }}
        />
      )}
    </>
  );
}
