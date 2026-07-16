import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { metaGetTemplates, metaTemplatesConfigured } from "@/lib/wa/provider";
import MetaTemplatesManager from "@/components/MetaTemplatesManager";

export const metadata = { title: "WhatsApp templates — Tinitiate WA" };

export default async function MetaTemplatesPage() {
  await requireUser();
  const configured = metaTemplatesConfigured();
  let templates = [];
  let error = "";
  if (configured) {
    try {
      templates = await metaGetTemplates({ approvedOnly: false });
    } catch (err) {
      error = err.message;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="text-sm text-slate-500">← Dashboard</Link>
      </div>

      <div>
        <h1 className="text-xl font-semibold">WhatsApp templates</h1>
        <p className="text-sm text-slate-500">
          Submit templates to Meta for review and track approval status. Approved templates can
          message any contact, even outside the 24h session window.
        </p>
      </div>

      <MetaTemplatesManager
        initialTemplates={templates}
        configured={configured}
        initialError={error}
      />
    </div>
  );
}
