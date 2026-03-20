import * as React from "react";
import { cn } from "@/lib/cn";

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>): React.ReactElement {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-[10px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[rgba(155,168,255,0.45)] focus:ring-2 focus:ring-[rgba(155,168,255,0.12)]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
