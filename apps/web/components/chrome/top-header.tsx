"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Sparkles, TerminalSquare } from "lucide-react";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/projects", label: "Projects", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function TopHeader(): React.ReactElement {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(70,72,75,0.12)] bg-[rgba(12,14,17,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1680px] items-center justify-between gap-4 px-5 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/projects" className="flex items-center gap-3 text-[18px] font-extrabold tracking-[-0.04em] text-[var(--text-primary)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-primary-dim)_100%)] text-[var(--color-on-primary)] shadow-[0_20px_48px_rgba(73,99,255,0.28)]">
              U
            </span>
            Uiverse
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                    active
                      ? "bg-[var(--surface-highest)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-secondary)] md:flex">
            <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
            Local-first visual builder
          </div>
          <Link
            href="/projects"
            className="hidden items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface)] hover:text-[var(--text-primary)] md:inline-flex"
          >
            <TerminalSquare className="h-4 w-4" />
            Bundle Flow
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] text-[var(--color-primary)]">
            <span className="text-sm font-bold">SA</span>
          </div>
        </div>
      </div>
    </header>
  );
}
