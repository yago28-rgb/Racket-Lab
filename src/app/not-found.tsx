import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="studio-bg flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display mt-5 text-[clamp(2.6rem,8vw,6rem)]">Out.</h1>
      <p className="mt-4 max-w-sm text-ink/60">Esta página no existe o se ha movido.</p>
      <div className="mt-10 flex gap-3">
        <ButtonLink href="/">Inicio</ButtonLink>
        <ButtonLink href="/raquetas" variant="secondary">
          Raquetas
        </ButtonLink>
      </div>
    </section>
  );
}
