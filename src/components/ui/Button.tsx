import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/format";

type Variant = "primary" | "secondary" | "ghost" | "inverted" | "outline-inverted";
type Size = "md" | "lg" | "sm";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-[transform,background-color,color,box-shadow,border-color] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-black hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]",
  secondary: "border border-line bg-white text-ink hover:border-ink",
  ghost: "text-ink hover:bg-cloud",
  inverted: "bg-white text-ink hover:bg-accent",
  "outline-inverted": "border border-white/25 text-white hover:border-white hover:bg-white/5",
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
