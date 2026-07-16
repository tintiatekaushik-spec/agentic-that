"use client";

import { useEffect, useState } from "react";

// Modal: pick an approved WhatsApp template and send it to a single contact.
// Works outside the 24h session window (unlike free text), so it's the
// re-engagement action for "Not responded" contacts. Live wiring is Meta
// Cloud API; falls back to WATI's endpoint if that's the active provider
// (kept for rollback, same as the chat composer).
export default function SendTemplateModal({ contact, provider, onClose, onSent }) {
  const [state, setState] = useState({ loading: true, configured: true, approved: [] });
  const [templateName, setTemplateName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isMeta = provider === "meta";
  const selected = state.approved.find((t) => t.name === templateName);

  useEffect(() => {
    const url = isMeta ? "/api/meta/templates" : "/api/wati/templates";
    // Kept for reference / rollback (inactive while WA_PROVIDER=meta):
    // fetch("/api/wati/templates", { cache: "no-store" })
    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) =>
        setState({ loading: false, configured: data.configured !== false, approved: data.templates || [] })
      )
      .catch(() => setState((s) => ({ ...s, loading: false })));
  }, [isMeta]);

  async function send() {
    if (!templateName) return;
    setBusy(true);
    setError("");
    const names = selected?.placeholderNames?.length
      ? selected.placeholderNames
      : Array.from({ length: selected?.placeholders || 0 }, (_, i) => String(i + 1));
    const templateParams = names.map((name) => ({ name, value: "{{name}}" }));

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactId: contact.id,
        watiTemplate: templateName,
        templateParams,
        language: selected?.language,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok || data.message?.error) {
      setError(data.error || data.message?.error || "Send failed");
      return;
    }
    onSent?.();
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <div className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-4 shadow-lg">
        <div>
          <h2 className="font-semibold">Send template</h2>
          <p className="text-xs text-slate-400">
            To {contact.name} ({contact.phone})
          </p>
        </div>

        {state.loading ? (
          <p className="text-sm text-slate-400">Loading templates…</p>
        ) : !state.configured ? (
          <p className="text-sm text-amber-700">{isMeta ? "Meta isn't configured." : "WATI isn't configured."}</p>
        ) : state.approved.length === 0 ? (
          <p className="text-sm text-slate-500">
            No approved WhatsApp templates found{isMeta ? " on your Meta WABA." : " in WATI."}
          </p>
        ) : (
          <>
            <select
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select an approved template</option>
              {state.approved.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name} ({t.language})
                </option>
              ))}
            </select>
            {selected?.body && (
              <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-2 text-xs text-slate-500">
                {selected.body}
              </p>
            )}
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm text-slate-600">
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !templateName}
            onClick={send}
            className="rounded-lg bg-[var(--brand-dark)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
