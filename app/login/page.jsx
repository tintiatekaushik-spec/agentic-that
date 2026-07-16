import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in — Tinitiate WA" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-dark)] text-xl font-bold text-white">
            T
          </div>
          <h1 className="text-lg font-semibold">Tinitiate WhatsApp Workflows</h1>
          <p className="text-sm text-slate-500">Sign in to your automation workspace</p>
        </div>
        <LoginForm />
        <p className="mt-4 text-center text-xs text-slate-400">
          Demo: <span className="font-mono">admin@demo.test</span> / <span className="font-mono">password</span>
        </p>
      </div>
    </main>
  );
}
