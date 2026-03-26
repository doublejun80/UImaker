"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";
import { COLOR_PRESET_VALUES, normalizeHexColor } from "@/lib/colors";
import { useLanguage } from "@/lib/copy";

interface ColorFieldProps {
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  className?: string;
}

export function ColorField({
  value,
  onChange,
  helperText,
  className
}: ColorFieldProps): React.ReactElement {
  const language = useLanguage();
  const [copied, setCopied] = React.useState(false);
  const [hoveredPreset, setHoveredPreset] = React.useState<string | null>(null);
  const hasExplicitValue = value.trim().length > 0;
  const normalizedValue = normalizeHexColor(value);
  const visibleCode = hasExplicitValue ? normalizedValue : null;

  React.useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function handleCopy(): Promise<void> {
    if (!visibleCode) {
      return;
    }

    await navigator.clipboard.writeText(visibleCode);
    setCopied(true);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={normalizedValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 cursor-pointer rounded-[10px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface-raised)] p-1"
          aria-label="Color picker"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full rounded-[10px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[rgba(155,168,255,0.45)] focus:ring-2 focus:ring-[rgba(155,168,255,0.12)]"
          placeholder="#9ba8ff"
          aria-label="Color code"
        />
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESET_VALUES.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              onMouseEnter={() => setHoveredPreset(preset)}
              onMouseLeave={() => setHoveredPreset((current) => (current === preset ? null : current))}
              onFocus={() => setHoveredPreset(preset)}
              onBlur={() => setHoveredPreset((current) => (current === preset ? null : current))}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition",
                normalizeHexColor(value) === preset
                  ? "scale-105 border-white"
                  : "border-[rgba(255,255,255,0.16)] hover:border-[rgba(255,255,255,0.4)]"
              )}
              style={{ backgroundColor: preset }}
              aria-label={`Select ${preset}`}
              title={preset}
            />
          ))}
        </div>
        {hoveredPreset ? (
          <div className="inline-flex rounded-full border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] px-3 py-1 font-mono text-xs text-[var(--text-primary)]">
            {language === "ko" ? "포인트 색 번호" : "Color code"}: {hoveredPreset}
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-3 rounded-[12px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface-black)] px-3 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-6 w-6 shrink-0 rounded-full border border-[rgba(255,255,255,0.18)]" style={{ backgroundColor: normalizedValue }} />
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {language === "ko" ? "선택된 색 번호" : "Selected color code"}
            </div>
            <div className="truncate font-mono text-sm text-[var(--text-primary)]">
              {visibleCode ?? (language === "ko" ? "상속값 사용 중" : "Using inherited value")}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            void handleCopy();
          }}
          disabled={!visibleCode}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[10px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-highest)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? (language === "ko" ? "복사됨" : "Copied") : (language === "ko" ? "복사" : "Copy")}
        </button>
      </div>
      {helperText ? <p className="text-xs leading-5 text-[var(--text-secondary)]">{helperText}</p> : null}
    </div>
  );
}
