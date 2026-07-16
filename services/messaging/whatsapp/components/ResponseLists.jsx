import Link from "next/link";
import { timeAgo } from "@/lib/format";

// Two side-by-side (stacked on mobile) lists: contacts who have replied vs
// contacts who were messaged but have gone quiet.
export default function ResponseLists({ responded, unresponded }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <ContactList
        title="Responded"
        icon="✅"
        contacts={responded}
        empty="No replies yet."
        renderMeta={(c) => c.last_reply}
        renderTime={(c) => c.last_reply_at}
        href="/dashboard/responses?tab=responded"
      />
      <ContactList
        title="Not responded"
        icon="⏳"
        contacts={unresponded}
        empty="Everyone you've messaged has replied."
        renderMeta={(c) => c.last_outbound}
        renderTime={(c) => c.last_outbound_at}
        href="/dashboard/responses?tab=not-responded"
      />
    </div>
  );
}

function ContactList({ title, icon, contacts, empty, renderMeta, renderTime, href }) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <Link href={href} className="mb-2 flex items-center gap-2 hover:underline">
        <span>{icon}</span>
        <h2 className="font-medium">{title}</h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
          {contacts.length}
        </span>
        <span className="ml-auto text-xs text-[var(--brand-dark)]">Open →</span>
      </Link>
      {contacts.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-100">
          {contacts.map((c) => (
            <li key={c.id}>
              <Link href={`/contacts/${c.id}`} className="block px-3 py-2 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.phone}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(renderTime(c))}</span>
                </div>
                {renderMeta(c) && (
                  <p className="mt-1 truncate text-xs text-slate-500">{renderMeta(c)}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
