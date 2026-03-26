"use client";

import { useEffect } from "react";
import { useUiverseStore } from "@/lib/store";
import { darkenHexColor, getContrastTextColor, normalizeHexColor } from "@/lib/colors";

export function StoreHydrator(): null {
  const hydrate = useUiverseStore((state) => state.hydrate);
  const language = useUiverseStore((state) => state.settings.language);
  const accent = useUiverseStore((state) => state.settings.theme.accent);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "ko";
  }, [language]);

  useEffect(() => {
    const root = document.documentElement;
    const safeAccent = normalizeHexColor(accent);
    root.style.setProperty("--color-primary", safeAccent);
    root.style.setProperty("--color-primary-dim", darkenHexColor(safeAccent));
    root.style.setProperty("--color-on-primary", getContrastTextColor(safeAccent));
  }, [accent]);

  return null;
}
