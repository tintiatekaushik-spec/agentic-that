import Link from "next/link";
import { timeAgo } from "@/lib/format";

// Two side-by-side (stacked on mobile) lists: chats with unseen replies vs
// chats whose replies have all been read. Mirrors ResponseLists.
export default function ReadUnreadLists({ unread, read }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <ContactList
        title="Unread"
        icon="📩"
        contacts={unread}
        empty="No unread replies — inbox zero."
        href="/dashboard/inbox?tab=unread"
        showCount
      />
      <ContactList
        title="Read"
        icon="📖"
        contacts={read}
        empty="Nothing read yet."
        href="/dashboard/inbox?tab=read"
      />
    </div>
  );
}

function ContactList({ title, icon, contacts, empty, href, showCount }) {
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
                  <div className="flex shrink-0 items-center gap-2">
                    {showCount && c.unread_count > 0 && (
                      <span className="rounded-full bg-[var(--brand)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {c.unread_count}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{timeAgo(c.last_reply_at)}</span>
                  </div>
                </div>
                {c.last_reply && (
                  <p className="mt-1 truncate text-xs text-slate-500">{c.last_reply}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
