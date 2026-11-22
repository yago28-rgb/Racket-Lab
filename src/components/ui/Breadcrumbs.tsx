import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/format";

/** Visible breadcrumb trail; pair it with breadcrumbLd() for structured data. */
export function Breadcrumbs({ items, className }: { items: { name: string; path: string }[]; className?: string }) {
  return (
    <nav aria-label="Ruta de navegación" className={cn("flex", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-[12px] text-muted">
        {items.map((it, i) => (
          <li key={it.path} className="flex items-center gap-1">
            {i < items.length - 1 ? (
              <>
                <Link href={it.path} className="hover:text-ink hover:underline">
                  {it.name}
                </Link>
                <ChevronRight size={12} aria-hidden />
              </>
            ) : (
              <span aria-current="page" className="text-ink">
                {it.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
