import { cn } from "@/lib/format";

/**
 * Typographic logotype. The mark is a 3×3 string-bed grid inside a rounded
 * frame — a racket face reduced to its essence, read as "lab grid".
 */
export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  const fg = inverted ? "#fff" : "#111";
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
        <rect x="1" y="1" width="20" height="20" rx="6" fill="none" stroke={fg} strokeWidth="1.8" />
        <path d="M8 4.5v13M14 4.5v13M4.5 8h13M4.5 14h13" stroke={fg} strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="14" cy="8" r="1.7" fill="var(--color-accent)" />
      </svg>
      <span className="text-[15px] font-semibold tracking-[0.22em]" style={{ color: fg }}>
        RACKET<span className="font-light">LAB</span>
      </span>
    </span>
  );
}
