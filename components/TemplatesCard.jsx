"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Add/list/delete CRM templates (canned free-text, substituted with {{name}} /
// {{business}}). Shared between Settings and the Dashboard.
export default function TemplatesCard({ templates }) {
  const router = useRouter();
  const [tpl, setTpl] = useState({ name: "", category: "marketing", body: "" });
  const setT = (k) => (e) => setTpl((t) => ({ ...t, [k]: e.target.value }));

  async function addTpl(e) {
    e.preventDefault();
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tpl),
    });
    if (res.ok) {
      setTpl({ name: "", category: "marketing", body: "" });
      router.refresh();
    }
  }

  async function delTpl(id) {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-1 font-medium">Message templates</h2>
      <p className="mb-3 text-xs text-slate-400">
        Variables: <span className="font-mono">{"{{name}}"}</span>,{" "}
        <span className="font-mono">{"{{business}}"}</span>
      </p>

      <ul className="mb-4 space-y-2">
        {templates.map((t) => (
          <li key={t.id} className="rounded-lg border border-slate-200 p-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {t.name}{" "}
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase text-slate-500">
                    {t.category}
                  </span>
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-500">{t.body}</p>
              </div>
              <button onClick={() => delTpl(t.id)} className="shrink-0 text-xs text-red-500">
                Delete
              </button>
            </div>
          </li>
        ))}
        {templates.length === 0 && <li className="text-sm text-slate-400">No templates yet.</li>}
      </ul>

      <form onSubmit={addTpl} className="space-y-2 border-t border-slate-100 pt-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={tpl.name}
            onChange={setT("name")}
            placeholder="Template name"
            required
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={tpl.category}
            onChange={setT("category")}
            className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
          >
            <option value="welcome">welcome</option>
            <option value="marketing">marketing</option>
            <option value="utility">utility</option>
          </select>
        </div>
        <textarea
          value={tpl.body}
          onChange={setT("body")}
          placeholder="Hi {{name}}, welcome to {{business}}!"
          rows={2}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white">
          + Add template
        </button>
      </form>
    </section>
  );
}
