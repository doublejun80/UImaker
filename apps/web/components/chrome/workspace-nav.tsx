"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, HelpCircle, LayoutTemplate, Layers3, MessageSquare, Settings2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/lib/copy";

interface WorkspaceNavProps {
  onCreateProject?: () => void;
}

export function WorkspaceNav({ onCreateProject }: WorkspaceNavProps): React.ReactElement {
  const pathname = usePathname();
  const copy = useCopy();
  const items = [
    { href: "/projects", label: copy.common.projects, icon: FolderKanban },
    { href: "/settings", label: copy.common.settings, icon: Settings2 },
    { href: "/help", label: copy.common.help, icon: HelpCircle }
  ];

  return (
    <aside className="surface-panel hidden w-[280px] shrink-0 flex-col justify-between rounded-none border-y-0 border-l-0 px-5 py-6 lg:flex">
      <div className="space-y-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">{copy.workspaceNav.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">{copy.workspaceNav.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            {copy.workspaceNav.description}
          </p>
        </div>
        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[12px] px-4 py-3 text-sm font-medium transition",
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
          <div className="rounded-[12px] border border-dashed border-[rgba(70,72,75,0.15)] p-4 text-sm text-[var(--text-secondary)]">
            <div className="mb-3 flex items-center gap-2 text-[var(--text-primary)]">
              <LayoutTemplate className="h-4 w-4 text-[var(--color-primary)]" />
              {copy.workspaceNav.elements}
            </div>
            <div className="mb-2 flex items-center gap-2">
              <Layers3 className="h-4 w-4" />
              {copy.workspaceNav.elementLine1}
            </div>
            <div className="mb-2 flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              {copy.workspaceNav.elementLine2}
            </div>
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              {copy.workspaceNav.elementLine3}
            </div>
          </div>
        </nav>
      </div>
      <div className="space-y-3 border-t border-[rgba(70,72,75,0.15)] pt-5">
        {onCreateProject ? (
          <Button variant="primary" className="w-full justify-center" onClick={onCreateProject}>
            + {copy.common.createProject}
          </Button>
        ) : (
          <Link
            href="/projects"
            className="inline-flex h-10 w-full items-center justify-center rounded-[8px] bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-primary-dim)_100%)] px-4 text-sm font-semibold text-[var(--color-on-primary)] shadow-[0_20px_48px_rgba(73,99,255,0.28)] transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-110"
          >
            + {copy.common.createProject}
          </Link>
        )}
        <div className="space-y-1 text-sm text-[var(--text-secondary)]">
          <Link href="/help" className="flex items-center gap-3 rounded-[10px] px-3 py-2 hover:bg-[var(--surface)]">
            <HelpCircle className="h-4 w-4" />
            {copy.common.helpCenter}
          </Link>
          <Link href="/help#feedback" className="flex items-center gap-3 rounded-[10px] px-3 py-2 hover:bg-[var(--surface)]">
            <MessageSquare className="h-4 w-4" />
            {copy.common.feedback}
          </Link>
        </div>
      </div>
    </aside>
  );
}
