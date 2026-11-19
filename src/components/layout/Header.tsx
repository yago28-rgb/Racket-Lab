"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useCart } from "@/store/cart";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/lib/format";
import { SearchDialog } from "./SearchDialog";

const nav = [
  { href: "/raquetas", label: "Raquetas" },
  { href: "/racket-finder", label: "Racket Finder" },
  { href: "/comparar", label: "Comparar" },
  { href: "/marcas", label: "Marcas" },
  { href: "/#tecnologia", label: "Tecnología" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const hydrated = useHydrated();
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const openCart = useCart((s) => s.open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close the mobile menu on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenu(false);
  }

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || menu ? "border-b border-line/80 bg-white/75 backdrop-blur-xl backdrop-saturate-150" : "border-b border-transparent",
        )}
      >
        <div className="container-rl flex h-14 items-center justify-between gap-6">
          <Link href="/" aria-label="RACKET LAB, inicio" className="shrink-0">
            <Logo />
          </Link>
          <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] transition-colors hover:text-ink",
                  pathname.startsWith(n.href) && n.href !== "/#tecnologia" ? "text-ink" : "text-ink/60",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearch(true)}
              className="flex h-9 items-center gap-2 rounded-full px-2.5 text-ink/70 transition-colors hover:bg-cloud hover:text-ink"
              aria-label="Buscar raquetas"
            >
              <Search size={18} />
              <kbd className="hidden rounded border border-line px-1.5 font-mono text-[10px] text-muted md:inline">⌘K</kbd>
            </button>
            <button
              type="button"
              onClick={openCart}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-cloud hover:text-ink"
              aria-label={`Abrir carrito${hydrated && count ? `, ${count} artículos` : ""}`}
            >
              <ShoppingBag size={18} />
              {hydrated && count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-white">
                  {count}
                </span>
              )}
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-cloud lg:hidden"
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? "Cerrar menú" : "Abrir menú"}
            >
              {menu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {menu && (
            <motion.nav
              id="mobile-menu"
              aria-label="Móvil"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden lg:hidden"
            >
              <ul className="container-rl flex flex-col pb-8 pt-2">
                {nav.map((n, i) => (
                  <motion.li key={n.href} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                    <Link href={n.href} className="block border-b border-line py-4 text-2xl font-semibold tracking-tight">
                      {n.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      <SearchDialog open={search} onClose={() => setSearch(false)} />
    </>
  );
}
