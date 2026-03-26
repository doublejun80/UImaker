"use client";

import type { CSSProperties } from "react";
import type { Language } from "@uiverse/schema";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { DesignKitSummary } from "@/lib/design-kits";

function buttonLabel(treatment: DesignKitSummary["buttonTreatment"], language: Language): string {
  switch (treatment) {
    case "solid-block":
      return language === "ko" ? "단색 버튼" : "Solid button";
    case "soft-outline":
      return language === "ko" ? "소프트 아웃라인" : "Soft outline";
    case "quiet-outline":
      return language === "ko" ? "조용한 아웃라인" : "Quiet outline";
    case "gradient-pill":
    default:
      return language === "ko" ? "그라데이션 필" : "Gradient pill";
  }
}

function sampleButtonStyle(kit: DesignKitSummary, secondary = false): CSSProperties {
  if (secondary) {
    return {
      backgroundColor: kit.colors.surfaceAlt,
      color: kit.colors.text,
      border: `1px solid ${kit.colors.border}`
    };
  }

  switch (kit.buttonTreatment) {
    case "solid-block":
      return { backgroundColor: kit.colors.accent, color: kit.colors.accentText };
    case "soft-outline":
      return {
        backgroundColor: kit.colors.surfaceAlt,
        color: kit.colors.accent,
        border: `1px solid ${kit.colors.accent}`
      };
    case "quiet-outline":
      return {
        backgroundColor: "transparent",
        color: kit.colors.text,
        border: `1px solid ${kit.colors.border}`
      };
    case "gradient-pill":
    default:
      return {
        backgroundImage: `linear-gradient(135deg, ${kit.colors.accent} 0%, ${kit.colors.accentSoft} 100%)`,
        color: kit.colors.accentText
      };
  }
}

export function DesignKitGallery({
  kits,
  selectedId,
  onSelect,
  language
}: {
  kits: DesignKitSummary[];
  selectedId: string;
  onSelect: (designKitId: string) => void;
  language: Language;
}): React.ReactElement {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {kits.map((kit) => {
        const selected = kit.id === selectedId;
        return (
          <button
            key={kit.id}
            type="button"
            onClick={() => onSelect(kit.id)}
            className={cn(
              "rounded-[24px] border p-5 text-left transition",
              selected
                ? "border-[rgba(155,168,255,0.45)] bg-[rgba(155,168,255,0.08)] shadow-[0_20px_48px_rgba(0,0,0,0.28)]"
                : "border-[rgba(70,72,75,0.15)] bg-[var(--surface)] hover:bg-[var(--surface-highest)]"
            )}
          >
            <div
              className="overflow-hidden rounded-[22px] border border-[rgba(255,255,255,0.08)] p-4"
              style={{ background: kit.colors.canvas }}
            >
              <div className="grid gap-3 lg:grid-cols-[112px_minmax(0,1fr)]">
                <div className="space-y-2">
                  {[kit.colors.accent, kit.colors.accentSoft, kit.colors.surfaceAlt, kit.colors.surface].map((color, index) => (
                    <div
                      key={`${kit.id}-${color}-${index}`}
                      className="rounded-[14px] border border-[rgba(255,255,255,0.08)] p-2"
                      style={{ background: color }}
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: index < 2 ? kit.colors.accentText : kit.colors.text }}>
                        {index === 0 ? "Primary" : index === 1 ? "Accent" : index === 2 ? "Surface" : "Base"}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4">
                      <div className="text-[44px] font-extrabold leading-none" style={{ color: kit.colors.text }}>
                        Aa
                      </div>
                      <div className="mt-3 text-xs uppercase tracking-[0.18em]" style={{ color: kit.colors.accent }}>
                        {kit.typography.displaySize} / {kit.typography.bodySize}
                      </div>
                    </div>
                    <div className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4">
                      <div className="space-y-2">
                        <div className="h-2 w-16 rounded-full" style={{ background: kit.colors.accent }} />
                        <div className="h-2 w-24 rounded-full" style={{ background: kit.colors.text, opacity: 0.9 }} />
                        <div className="h-2 w-20 rounded-full" style={{ background: kit.colors.muted, opacity: 0.7 }} />
                      </div>
                      <div className="mt-4 text-xs" style={{ color: kit.colors.muted }}>
                        {kit.typography.lineHeight} line-height
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className="inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold"
                        style={{
                          ...sampleButtonStyle(kit),
                          borderRadius: kit.radii.button
                        }}
                      >
                        {language === "ko" ? "기본" : "Primary"}
                      </span>
                      <span
                        className="inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold"
                        style={{
                          ...sampleButtonStyle(kit, true),
                          borderRadius: kit.radii.button
                        }}
                      >
                        {language === "ko" ? "보조" : "Secondary"}
                      </span>
                    </div>
                    <div className="mt-3 text-[11px] uppercase tracking-[0.18em]" style={{ color: kit.colors.muted }}>
                      {buttonLabel(kit.buttonTreatment, language)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold tracking-[-0.03em]">{kit.name}</div>
                <div className="mt-1 text-sm font-medium" style={{ color: kit.colors.accent }}>
                  {kit.bestFor}
                </div>
              </div>
              {selected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(255,255,255,0.08)] px-3 py-1 text-xs text-[var(--text-primary)]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {language === "ko" ? "선택됨" : "Selected"}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{kit.summary}</p>
          </button>
        );
      })}
    </div>
  );
}
