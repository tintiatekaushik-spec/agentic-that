import Link from "next/link";

// Compact status summary + link into the full WhatsApp templates manager
// (/dashboard/templates) — distinct from the local CRM "Message templates"
// card, which are canned free-text quick replies, not Meta-approved templates.
export default function MetaTemplatesSummary({ templates, configured }) {
  const counts = { APPROVED: 0, PENDING: 0, REJECTED: 0 };
  for (const t of templates) {
    const s = String(t.status).toUpperCase();
    if (s in counts) counts[s]++;
  }

  return (
    <Link
      href="/dashboard/templates"
      className="block rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 hover:ring-[var(--brand)]"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-medium">WhatsApp templates (Meta)</h2>
        <span className="rounded-lg bg-[var(--brand-dark)] px-4 py-2 text-sm font-semibold text-white">
          Manage →
        </span>
      </div>
      {!configured ? (
        <p className="mt-1 text-sm text-amber-700">Meta isn&apos;t configured.</p>
      ) : (
        <div className="mt-2 flex gap-2 text-xs">
          <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">
            {counts.APPROVED} approved
          </span>
          <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">
            {counts.PENDING} pending
          </span>
          <span className="rounded-full bg-red-100 px-2 py-1 text-red-700">
            {counts.REJECTED} rejected
          </span>
        </div>
      )}
    </Link>
  );
}
