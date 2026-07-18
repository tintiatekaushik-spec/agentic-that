import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@whatsapp/lib/auth";
import WhatsAppLoginForm from "@whatsapp/components/WhatsAppLoginForm";

export const metadata = { title: "WhatsApp sign in - AgenticThat" };

export default async function WhatsAppLoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <section className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <Link href="/" className="mb-6 inline-flex text-xs font-medium text-slate-500 hover:text-slate-900">← AgenticThat</Link>
        <div className="mb-6">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-dark)] text-sm font-bold text-white">WA</div>
          <h1 className="text-lg font-semibold text-slate-900">WhatsApp workspace</h1>
          <p className="mt-1 text-sm text-slate-500">Use your WhatsApp service credentials.</p>
        </div>
        <WhatsAppLoginForm />
        <p className="mt-4 text-center text-xs text-slate-400">
          Temporary demo: <span className="font-mono">admin@demo.test</span> / <span className="font-mono">password</span>
        </p>
      </section>
    </main>
  );
}
