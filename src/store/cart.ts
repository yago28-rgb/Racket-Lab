"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { GripSize } from "@/lib/recommendation/types";
import type { ShippingZone } from "@/lib/shipping";

export interface CartLine {
  /** Unique per racket + grip + stringing combination. */
  key: string;
  racketId: string;
  grip: Exclude<GripSize, "unknown">;
  stringing: boolean;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  zone: ShippingZone;
  isOpen: boolean;
  add: (line: Omit<CartLine, "key" | "quantity">, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setZone: (zone: ShippingZone) => void;
  open: () => void;
  close: () => void;
}

const MAX_QTY = 10;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      zone: "ES",
      isOpen: false,
      add: (line, quantity = 1) =>
        set((s) => {
          const key = `${line.racketId}|${line.grip}|${line.stringing ? "s" : "u"}`;
          const existing = s.lines.find((l) => l.key === key);
          const lines = existing
            ? s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l))
            : [...s.lines, { ...line, key, quantity: Math.min(MAX_QTY, quantity) }];
          return { lines, isOpen: true };
        }),
      setQuantity: (key, quantity) =>
        set((s) => ({
          lines:
            quantity <= 0
              ? s.lines.filter((l) => l.key !== key)
              : s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l)),
        })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
      setZone: (zone) => set({ zone }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "racketlab-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines, zone: s.zone }),
    },
  ),
);
