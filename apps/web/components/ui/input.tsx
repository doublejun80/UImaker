import * as React from "react";
import { cn } from "@/lib/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-[10px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[rgba(155,168,255,0.45)] focus:ring-2 focus:ring-[rgba(155,168,255,0.12)]",
        className
      )}
      {...props}
    />
  );
});
