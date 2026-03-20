"use client";

import { useEffect } from "react";
import { useUiverseStore } from "@/lib/store";

export function StoreHydrator(): null {
  const hydrate = useUiverseStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
