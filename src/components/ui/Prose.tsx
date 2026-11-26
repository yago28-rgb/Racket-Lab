import type { ReactNode } from "react";

/** Long-form pages set like a magazine: sticky title column, readable measure. */
export function LegalPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <article className="container-rl grid gap-12 pb-28 pt-28 md:grid-cols-12 md:pt-36">
      <header className="md:col-span-4">
        <div className="md:sticky md:top-24">
          <p className="text-[12px] uppercase tracking-[0.2em] text-stone">{eyebrow}</p>
          <h1 className="mt-4 text-[clamp(2.4rem,4.6vw,4.4rem)] font-semibold leading-[0.92] tracking-[-0.05em]">{title}</h1>
        </div>
      </header>
      <div className="space-y-6 text-[16px] leading-[1.75] text-ink-soft md:col-span-7 md:col-start-6 [&_a]:text-club [&_h2]:mt-14 [&_h2]:border-t [&_h2]:border-line [&_h2]:pt-8 [&_h2]:text-[1.6rem] [&_h2]:font-semibold [&_h2]:tracking-[-0.03em] [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink [&_ul]:space-y-2">
        {children}
      </div>
    </article>
  );
}
