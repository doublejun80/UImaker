"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, HelpCircle, LayoutTemplate, Layers3, MessageSquare, Settings2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/settings", label: "Settings", icon: Settings2 }
];

interface WorkspaceNavProps {
  onCreateProject?: () => void;
}

export function WorkspaceNav({ onCreateProject }: WorkspaceNavProps): React.ReactElement {
  const pathname = usePathname();

  return (
    <aside className="surface-panel hidden w-[280px] shrink-0 flex-col justify-between rounded-none border-y-0 border-l-0 px-5 py-6 lg:flex">
      <div className="space-y-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Workspace</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">Uiverse Studio</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Navigate projects, local settings, and component structures from a single dark workspace.
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
              Elements
            </div>
            <div className="mb-2 flex items-center gap-2">
              <Layers3 className="h-4 w-4" />
              Nested layout builder
            </div>
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              JSON bundle export
            </div>
          </div>
        </nav>
      </div>
      <div className="space-y-3 border-t border-[rgba(70,72,75,0.15)] pt-5">
        <Button variant="primary" className="w-full justify-center" onClick={onCreateProject}>
          + Create Project
        </Button>
        <div className="space-y-1 text-sm text-[var(--text-secondary)]">
          <div className="flex items-center gap-3 rounded-[10px] px-3 py-2 hover:bg-[var(--surface)]">
            <HelpCircle className="h-4 w-4" />
            Help Center
          </div>
          <div className="flex items-center gap-3 rounded-[10px] px-3 py-2 hover:bg-[var(--surface)]">
            <MessageSquare className="h-4 w-4" />
            Feedback
          </div>
        </div>
      </div>
    </aside>
  );
}
