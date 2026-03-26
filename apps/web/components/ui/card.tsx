import * as React from "react";
import { cn } from "@/lib/cn";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Card(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-[18px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] text-[var(--text-primary)] shadow-[0_18px_42px_rgba(0,0,0,0.32)]",
        className
      )}
      {...props}
    />
  );
});
