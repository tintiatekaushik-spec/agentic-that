"use client";

import { formatClock } from "@whatsapp/lib/format";
import { useMounted } from "./useMounted";

// WhatsApp-styled chat bubble: green for outgoing, white for incoming, with a
// corner tail, and the timestamp + delivery ticks inside the bubble like WA.
// `children` renders extra content under the body (e.g. interactive buttons).
// `phones` is a { phoneNumberId: { short, label, color } } map — when the
// business has multiple sender numbers, each bubble is tagged with the one it
// went through.
export default function MessageBubble({ m, children, phones }) {
  const mounted = useMounted();
  const out = m.direction === "out";
  const isButtonReply = m.kind === "button_reply";
  const failed = m.status === "failed";
  const phone = phones && Object.keys(phones).length > 1 ? phones[m.phone_number_id] : null;

  return (
    <div
      className={`relative max-w-[80%] rounded-lg px-2.5 py-1.5 text-sm shadow-sm ${
        out
          ? "self-end rounded-tr-none bg-[var(--bubble-out)]"
          : "self-start rounded-tl-none bg-white"
      } ${isButtonReply ? "ring-2 ring-[var(--brand)]" : ""}`}
    >
      {/* Corner tail */}
      {out ? (
        <span className="absolute -right-1.5 top-0 h-3 w-2 bg-[var(--bubble-out)] [clip-path:polygon(0_0,100%_0,0_100%)]" />
      ) : (
        <span className="absolute -left-1.5 top-0 h-3 w-2 bg-white [clip-path:polygon(0_0,100%_0,100%_100%)]" />
      )}

      {m.template_name && (
        <span className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {m.template_name}
        </span>
      )}
      {isButtonReply && (
        <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-dark)]">
          👆 button tapped
        </span>
      )}

      <p className="whitespace-pre-wrap break-words">{m.body}</p>

      {children}

      <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] leading-none text-slate-500">
        {phone && (
          <span className="mr-auto flex items-center gap-0.5" title={phone.label}>
            <span className="text-[8px]" style={{ color: phone.color }}>
              ●
            </span>
            {phone.short}
          </span>
        )}
        {mounted ? formatClock(m.created_at) : ""}
        {out && (failed ? <span className="font-semibold text-red-500">!</span> : <Ticks status={m.status} />)}
      </span>
    </div>
  );
}

function Ticks({ status }) {
  if (status === "read") return <span className="tracking-tighter text-[#53bdeb]">✓✓</span>;
  if (status === "delivered") return <span className="tracking-tighter text-slate-400">✓✓</span>;
  return <span className="text-slate-400">✓</span>; // sent / queued
}
