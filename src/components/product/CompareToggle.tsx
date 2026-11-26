"use client";

import { Check, Plus } from "lucide-react";
import { useCompare } from "@/store/compare";
import { cn } from "@/lib/format";
import { useHydrated } from "@/hooks/useHydrated";
import { useToast } from "@/store/toast";
import { getRacketById } from "@/lib/catalog";
import { fullRacketName } from "@/lib/format";
import { mainPhoto } from "@/lib/media";

export function CompareToggle({ id, className, label = true }: { id: string; className?: string; label?: boolean }) {
  const hydrated = useHydrated();
  const active = useCompare((s) => s.ids.includes(id)) && hydrated;
  const toggle = useCompare((s) => s.toggle);
  const count = useCompare((s) => s.ids.length);
  const toast = useToast((s) => s.push);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const r = getRacketById(id);
        const adding = !active;
        if (adding && count >= 3) {
          toast({ title: "El comparador admite tres raquetas", detail: "Quita una para añadir otra.", action: { href: "/comparar", label: "Abrir" } });
          return;
        }
        toggle(id);
        if (r)
          toast(
            adding
              ? { title: "Añadida al comparador", detail: `${fullRacketName(r)} · ${count + 1} de 3`, image: mainPhoto(r), action: { href: "/comparar", label: "Comparar" } }
              : { title: "Quitada del comparador", detail: fullRacketName(r), image: mainPhoto(r) },
          );
      }}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "border-club bg-club text-cream" : "border-line bg-paper/80 text-ink backdrop-blur hover:border-ink",
        className,
      )}
    >
      {active ? <Check size={13} /> : <Plus size={13} />}
      {label && (active ? "Comparando" : "Comparar")}
    </button>
  );
}
