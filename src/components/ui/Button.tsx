import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/format";

type Variant = "primary" | "secondary" | "ghost" | "inverted" | "outline-inverted";
type Size = "md" | "lg" | "sm";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-[transform,background-color,color,box-shadow,border-color] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-club text-cream hover:bg-night hover:shadow-[0_12px_30px_-12px_rgba(13,34,25,0.6)]",
  secondary: "border border-line bg-paper text-ink hover:border-club hover:text-club",
  ghost: "text-ink hover:bg-cloud",
  inverted: "bg-cream text-club hover:bg-paper hover:shadow-[0_12px_40px_-12px_rgba(196,162,101,0.55)]",
  "outline-inverted": "border border-cream/30 text-cream hover:border-gold hover:text-paper",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[15px]",
  lg: "h-14 px-8 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({ variant, size, className, ...rest }: Common & ComponentProps<"button">) {
  return <button className={buttonClass(variant, size, className)} {...rest} />;
}

export function ButtonLink({ variant, size, className, ...rest }: Common & ComponentProps<typeof Link>) {
  return <Link className={buttonClass(variant, size, className)} {...rest} />;
}
