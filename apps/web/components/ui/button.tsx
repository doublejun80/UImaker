import * as React from "react";
import { cn } from "@/lib/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-primary-dim)_100%)] text-[var(--color-on-primary)] shadow-[0_20px_48px_rgba(73,99,255,0.28)] hover:brightness-110",
  secondary: "bg-[var(--surface-bright)] text-[var(--text-primary)] hover:bg-[var(--surface-highest)]",
  ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-highest)] hover:text-[var(--text-primary)]",
  danger: "bg-[rgba(215,51,87,0.18)] text-[var(--color-danger)] hover:bg-[rgba(215,51,87,0.28)]"
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-sm"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "secondary", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[8px] font-semibold transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
