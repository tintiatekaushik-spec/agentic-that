// Summary cards for outbound delivery + reply status. Server component — pure
// display, no client state needed.
export default function MessageStatCards({ stats }) {
  const cards = [
    { label: "Sent", value: stats.sent, tone: "text-slate-700" },
    { label: "Delivered", value: stats.delivered, tone: "text-green-600" },
    { label: "Failed", value: stats.failed, tone: "text-red-600" },
    { label: "Replies received", value: stats.inbound, tone: "text-[var(--brand-dark)]" },
    { label: "Response rate", value: `${stats.responseRate}%`, tone: "text-slate-700" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-200">
          <p className={`text-xl font-semibold ${c.tone}`}>{c.value}</p>
          <p className="mt-0.5 text-xs text-slate-500">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
