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
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const hydrated = useHydrated();
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const openCart = useCart((s) => s.open);

  // Transparent over the cinematic hero, compact glass bar once scrolled.
  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // Animated navigation: tucks away while reading down, returns on the way up.
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 240);
        lastY = y;
      }
      const hero = document.querySelector<HTMLElement>("[data-dark-hero]");
      setOnDark(!!hero && hero.dataset.headerLight !== "1" && hero.getBoundingClientRect().bottom > 72);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);
  const dark = onDark && !menu;
  const tucked = hidden && !menu && !search;
  // Lets sticky sub-bars (catalogue toolbar) follow the navigation as it hides and returns.
  useEffect(() => {
    document.documentElement.style.setProperty("--header-h", tucked ? "0px" : "3rem");
  }, [tucked]);

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
        data-dark={dark || undefined}
        className={cn(
          "group/header fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter,color,transform] duration-700 ease-[var(--ease-out-expo)]",
          tucked ? "-translate-y-full" : "translate-y-0",
          dark
            ? scrolled
              ? "border-white/10 bg-night/70 text-paper backdrop-blur-xl backdrop-saturate-150"
              : "border-transparent bg-transparent text-paper"
            : "border-ink/[0.08] bg-paper/80 text-ink backdrop-blur-xl backdrop-saturate-150",
        )}
      >
        <div
          className={cn(
            "container-rl flex items-center justify-between gap-6 transition-[height] duration-700 ease-[var(--ease-out-expo)]",
            "h-12",
          )}
        >
          <Link href="/" aria-label="RACKET LAB, inicio" className="shrink-0">
            <Logo />
          </Link>
          <nav aria-label="Principal" className="hidden items-center gap-2 lg:flex">
            {nav.map((n) => {
              const active = pathname.startsWith(n.href) && n.href !== "/#tecnologia";
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "relative px-3.5 py-2 text-[13px] transition-opacity duration-300",
                    active ? "opacity-100" : "opacity-75 hover:opacity-100",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearch(true)}
              className="flex h-9 items-center gap-2 rounded-full px-2.5 opacity-80 transition-[opacity,background-color] hover:opacity-100 hover:bg-current/10"
              aria-label="Buscar raquetas"
            >
              <Search size={18} />
              <kbd className="hidden rounded border border-current/25 px-1.5 font-mono text-[10px] opacity-70 md:inline">⌘K</kbd>
            </button>
            <button
              type="button"
              onClick={openCart}
              className="relative flex h-9 w-9 items-center justify-center rounded-full opacity-80 transition-[opacity,background-color] hover:opacity-100 hover:bg-current/10"
              aria-label={`Abrir carrito${hydrated && count ? `, ${count} artículos` : ""}`}
            >
              <ShoppingBag size={18} />
              {hydrated && count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 520, damping: 14 }}
                  className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-club px-1 text-[10px] font-semibold text-white"
                >
                  {count}
                </motion.span>
              )}
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-current/10 lg:hidden"
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
              animate={{ height: "calc(100svh - 3rem)", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden bg-paper text-ink lg:hidden"
            >
              <ul className="container-rl flex flex-col pb-8 pt-6">
                {nav.map((n, i) => (
                  <motion.li key={n.href} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + 0.06 * i, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                    <Link href={n.href} className="block border-b border-line py-5 text-4xl font-semibold tracking-[-0.04em]">
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
