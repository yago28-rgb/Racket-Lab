"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** True only after hydration. Prevents mismatches when rendering persisted (localStorage) state. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
