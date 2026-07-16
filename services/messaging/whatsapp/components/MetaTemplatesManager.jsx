"use client";

import { useState } from "react";

const STATUS_STYLE = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
};

const EMPTY_FORM = {
  name: "",
  category: "UTILITY",
  language: "en_US",
  headerType: "none", // none | text | image
  headerText: "",
  bodyText: "",
  footerText: "",
};

const EMPTY_BUTTON = { type: "QUICK_REPLY", text: "", url: "", phoneNumber: "" };
const BUTTON_TYPE_LABEL = { QUICK_REPLY: "Quick reply", URL: "Website URL", PHONE_NUMBER: "Call phone" };

export default function MetaTemplatesManager({ initialTemplates, configured, initialError }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [error, setError] = useState(initialError || "");
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [buttons, setButtons] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [editing, setEditing] = useState(null); // { id, name } while editing an existing template
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Prefill the form from an existing template. Name + language are immutable
  // on Meta's side, so they render disabled while editing.
  function startEdit(t) {
    setForm({
      name: t.name,
      category: t.category || "UTILITY",
      language: t.language || "en_US",
      headerType: t.headerFormat === "IMAGE" ? "image" : t.headerFormat === "TEXT" ? "text" : "none",
      headerText: t.headerText || "",
      bodyText: t.body || "",
      footerText: t.footer || "",
    });
    setButtons(
      (t.buttons || []).map((b) => ({
        type: b.type || "QUICK_REPLY",
        text: b.text || "",
        url: b.url || "",
        phoneNumber: b.phoneNumber || "",
      }))
    );
    setImageFile(null);
    setEditing({ id: t.id, name: t.name });
    setFormError("");
    setSuccessMsg("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setButtons([]);
    setImageFile(null);
    setFormError("");
  }

  function addButton() {
    setButtons((b) => (b.length >= 10 ? b : [...b, { ...EMPTY_BUTTON }]));
  }
  function updateButton(i, key, value) {
    setButtons((b) => b.map((btn, idx) => (idx === i ? { ...btn, [key]: value } : btn)));
  }
  function removeButton(i) {
    setButtons((b) => b.filter((_, idx) => idx !== i));
  }

  async function refresh() {
    setRefreshing(true);
    setError("");
    try {
      const res = await fetch("/api/meta/templates?all=1", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setTemplates(data.templates || []);
      else setError(data.error || "Failed to load templates");
    } catch {
      setError("Network error");
    }
    setRefreshing(false);
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setFormError("");
    setSuccessMsg("");
    try {
      let headerImageHandle;
      if (form.headerType === "image") {
        if (!imageFile) {
          // Meta can't reuse the previous image on edit — a fresh upload
          // handle is required every time the header is an image.
          setFormError(
            editing
              ? "Editing an image-header template requires re-uploading the header image."
              : "Choose an image for the header"
          );
          setBusy(false);
          return;
        }
        const fd = new FormData();
        fd.append("file", imageFile);
        const uploadRes = await fetch("/api/meta/templates/upload-media", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Image upload failed");
        headerImageHandle = uploadData.handle;
      }

      const payload = {
        category: form.category,
        bodyText: form.bodyText.trim(),
        headerText: form.headerType === "text" ? form.headerText.trim() : undefined,
        headerImageHandle,
        footerText: form.footerText.trim(),
        buttons: buttons.filter((b) => b.text.trim()),
      };

      const res = editing
        ? await fetch(`/api/meta/templates/${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/meta/templates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, name: form.name.trim(), language: form.language }),
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (editing ? "Failed to update template" : "Failed to submit template"));

      setSuccessMsg(
        editing
          ? `"${form.name}" updated — the changes go back through Meta's review before they take effect.`
          : `"${form.name}" submitted — status: ${data.status || "PENDING"}. Meta usually reviews within minutes to a day.`
      );
      closeForm();
      refresh();
    } catch (err) {
      setFormError(err.message);
    }
    setBusy(false);
  }

  if (!configured) {
    return (
      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
        Meta isn&apos;t configured — set <span className="font-mono">META_WABA_ID</span> and{" "}
        <span className="font-mono">META_ACCESS_TOKEN</span> in <span className="font-mono">.env.local</span>.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={refresh}
          disabled={refreshing}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          {refreshing ? "Refreshing…" : "↻ Refresh status"}
        </button>
        <button
          onClick={() => (showForm ? closeForm() : setShowForm(true))}
          className="rounded-lg bg-[var(--brand-dark)] px-3 py-2 text-sm font-medium text-white"
        >
          {showForm ? "Cancel" : "+ New template"}
        </button>
      </div>

      {successMsg && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{successMsg}</p>}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {showForm && (
        <form onSubmit={submit} className="space-y-3 rounded-xl border border-[var(--brand)] bg-white p-4 shadow-sm">
          {editing && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Editing <span className="font-mono">{editing.name}</span> — name and language can&apos;t
              change, and the edited template goes back through Meta&apos;s review.
            </p>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-slate-500">Template name</span>
              <input
                value={form.name}
                onChange={setF("name")}
                placeholder="order_confirmation"
                pattern="[a-z0-9_]+"
                title="Lowercase letters, numbers, and underscores only"
                required
                disabled={!!editing}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-500">Category</span>
              <select
                value={form.category}
                onChange={setF("category")}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="UTILITY">Utility</option>
                <option value="MARKETING">Marketing</option>
                <option value="AUTHENTICATION">Authentication</option>
              </select>
            </label>
          </div>

          <label className="block text-sm">
            <span className="text-slate-500">Language</span>
            <select
              value={form.language}
              onChange={setF("language")}
              disabled={!!editing}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="en_US">English (US)</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </label>

          <div>
            <span className="text-sm text-slate-500">Header (optional)</span>
            <div className="mt-1 flex gap-2 text-xs">
              {["none", "text", "image"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, headerType: t }))}
                  className={`rounded-full px-3 py-1 ${
                    form.headerType === t ? "bg-[var(--brand-dark)] text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {t === "none" ? "None" : t === "text" ? "Text" : "Image"}
                </button>
              ))}
            </div>
            {form.headerType === "text" && (
              <input
                value={form.headerText}
                onChange={setF("headerText")}
                placeholder="Header text"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            )}
            {form.headerType === "image" && (
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="mt-2 w-full text-sm"
              />
            )}
          </div>

          <label className="block text-sm">
            <span className="text-slate-500">
              Body — use <span className="font-mono">{"{{1}}"}</span>, <span className="font-mono">{"{{2}}"}</span> for variables
            </span>
            <textarea
              value={form.bodyText}
              onChange={setF("bodyText")}
              rows={3}
              placeholder="Hi {{1}}, your order #{{2}} has been confirmed."
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm">
            <span className="text-slate-500">Footer (optional)</span>
            <input
              value={form.footerText}
              onChange={setF("footerText")}
              placeholder="Thank you for choosing us"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Buttons (optional)</span>
              {buttons.length < 10 && (
                <button type="button" onClick={addButton} className="text-xs font-medium text-[var(--brand-dark)]">
                  + Add button
                </button>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Up to 10 total; at most 2 can be Website URL / Call phone combined.
            </p>
            {buttons.length > 0 && (
              <div className="mt-2 space-y-2">
                {buttons.map((b, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-2 sm:flex-row sm:items-center">
                    <select
                      value={b.type}
                      onChange={(e) => updateButton(i, "type", e.target.value)}
                      className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                    >
                      {Object.entries(BUTTON_TYPE_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <input
                      value={b.text}
                      onChange={(e) => updateButton(i, "text", e.target.value)}
                      placeholder="Button text"
                      maxLength={25}
                      className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                    />
                    {b.type === "URL" && (
                      <input
                        value={b.url}
                        onChange={(e) => updateButton(i, "url", e.target.value)}
                        placeholder="https://example.com or https://example.com/{{1}}"
                        className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                      />
                    )}
                    {b.type === "PHONE_NUMBER" && (
                      <input
                        value={b.phoneNumber}
                        onChange={(e) => updateButton(i, "phoneNumber", e.target.value)}
                        placeholder="+15551234567"
                        className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeButton(i)}
                      className="shrink-0 text-xs text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={closeForm} className="rounded-lg px-3 py-2 text-sm text-slate-600">
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[var(--brand-dark)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy ? "Submitting…" : editing ? "Save changes" : "Submit for review"}
            </button>
          </div>
        </form>
      )}

      {templates.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No templates yet.</p>
      ) : (
        <ul className="space-y-2">
          {templates.map((t) => (
            <li key={t.id || t.name} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {t.name}{" "}
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase text-slate-500">
                      {t.category}
                    </span>{" "}
                    <span className="text-xs text-slate-400">{t.language}</span>
                  </p>
                  {t.headerFormat === "IMAGE" && (
                    <p className="mt-0.5 text-xs text-slate-400">🖼️ Image header</p>
                  )}
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-500">{t.body}</p>
                  {t.footer && <p className="mt-0.5 text-xs text-slate-400">{t.footer}</p>}
                  {t.buttons?.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {t.buttons.map((b, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600"
                          title={b.url || b.phoneNumber || ""}
                        >
                          {b.type === "URL" ? "🔗" : b.type === "PHONE_NUMBER" ? "📞" : "↩️"} {b.text}
                        </span>
                      ))}
                    </div>
                  )}
                  {t.rejectedReason && (
                    <p className="mt-1 text-xs text-red-600">Rejected: {t.rejectedReason}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase ${
                      STATUS_STYLE[String(t.status).toUpperCase()] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {t.status}
                  </span>
                  {/* Meta only allows editing APPROVED / REJECTED / PAUSED templates */}
                  {["APPROVED", "REJECTED", "PAUSED"].includes(String(t.status).toUpperCase()) && (
                    <button
                      onClick={() => startEdit(t)}
                      className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      ✏️ Edit
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
