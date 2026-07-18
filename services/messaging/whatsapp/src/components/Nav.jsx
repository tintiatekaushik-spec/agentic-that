"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Eagle Eye", icon: "👁️" },
  { href: "/messages",  label: "Message",   icon: "💬" },
  { href: "/contacts",  label: "Notify",    icon: "🔔" },
  { href: "/groups",    label: "Groups",    icon: "📣" },
  { href: "/settings",  label: "Settings",  icon: "⚙️" },
];

export default function Nav({ businessName }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/whatsapp/auth/logout", { method: "POST" });
    router.push("/whatsapp/login");
    router.refresh();
  }

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-[var(--brand-dark)] px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15 text-sm font-bold">
            T
          </span>
          <span className="text-sm font-semibold">{businessName || "Tinitiate WA"}</span>
        </div>
        {/* Desktop tabs */}
        <nav className="hidden gap-1 sm:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-3 py-1.5 text-sm ${
                isActive(l.href) ? "bg-white/20 font-medium" : "text-white/80 hover:bg-white/10"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="text-sm text-white/80 hover:text-white">
          Sign out
        </button>
      </header>

      {/* Bottom nav — one column per link on mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-slate-200 bg-white sm:hidden">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex flex-col items-center gap-0.5 py-2 text-[10px] ${
              isActive(l.href) ? "text-[var(--brand-dark)] font-medium" : "text-slate-500"
            }`}
          >
            <span className="text-base leading-none">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
