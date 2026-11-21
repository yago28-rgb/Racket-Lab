import type { ReactNode } from "react";

export function LegalPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <article className="container-rl max-w-3xl pb-28 pt-32 md:pt-40">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display mt-5 text-[clamp(2.4rem,6vw,4.5rem)]">{title}</h1>
      <div className="mt-12 space-y-6 text-[15px] leading-relaxed text-ink/75 [&_h2]:mt-12 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </article>
  );
}
