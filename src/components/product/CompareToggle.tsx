"use client";

import { Check, Plus } from "lucide-react";
import { useCompare } from "@/store/compare";
import { cn } from "@/lib/format";
import { useHydrated } from "@/hooks/useHydrated";

export function CompareToggle({ id, className, label = true }: { id: string; className?: string; label?: boolean }) {
  const hydrated = useHydrated();
  const active = useCompare((s) => s.ids.includes(id)) && hydrated;
  const toggle = useCompare((s) => s.toggle);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "border-ink bg-ink text-white" : "border-line bg-white/80 text-ink backdrop-blur hover:border-ink",
        className,
      )}
    >
      {active ? <Check size={13} /> : <Plus size={13} />}
      {label && (active ? "Comparando" : "Comparar")}
    </button>
  );
}
