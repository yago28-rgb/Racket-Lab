"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getRacketBySlug } from "@/lib/catalog";
import { fullRacketName } from "@/lib/format";

export function ContactForm() {
  const sp = useSearchParams();
  const product = getRacketBySlug(sp.get("producto") ?? "");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  if (state === "sent") {
    return (
      <div className="rounded-[var(--radius-card)] bg-mist p-8" role="status">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-club text-cream">
          <Check size={18} />
        </span>
        <p className="mt-5 text-lg font-medium">Mensaje enviado.</p>
        <p className="mt-2 text-sm text-muted">Te responderemos por email lo antes posible.</p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setState("sending");
        const body = Object.fromEntries(new FormData(e.currentTarget));
        try {
          const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setState("sent");
        } catch (err) {
          setError(err instanceof Error && err.message ? err.message : "No se ha podido enviar.");
          setState("idle");
        }
      }}
    >
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className="text-sm font-medium">Nombre</span>
          <input name="name" required maxLength={120} autoComplete="name" className="mt-2 h-12 w-full rounded-xl border border-line px-4 outline-none focus:border-ink" />
        </label>
        <label>
          <span className="text-sm font-medium">Email</span>
          <input name="email" type="email" required autoComplete="email" className="mt-2 h-12 w-full rounded-xl border border-line px-4 outline-none focus:border-ink" />
        </label>
      </div>
      <label>
        <span className="text-sm font-medium">Asunto</span>
        <select name="topic" defaultValue={product ? "producto" : "general"} className="mt-2 h-12 w-full rounded-xl border border-line bg-paper px-4 outline-none focus:border-ink">
          <option value="general">Consulta general</option>
          <option value="producto">Información de producto</option>
          <option value="pedido">Mi pedido</option>
          <option value="encordado">Encordado y personalización</option>
        </select>
      </label>
      <label>
        <span className="text-sm font-medium">Mensaje</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          defaultValue={product ? `Me interesa la ${fullRacketName(product)}. ¿Podéis confirmarme precio y disponibilidad?` : ""}
          className="mt-2 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={state === "sending"}>
        {state === "sending" ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
