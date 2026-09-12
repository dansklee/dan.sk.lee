import { gifts } from "@/data/wedding";

export function Gifts() {
  return (
    <section className="bg-cream-light px-6 py-24 text-center sm:py-32" aria-labelledby="gifts">
      <p className="tracking-label font-display text-sm text-ink">
        {gifts.eyebrow}
      </p>

      <h2 id="gifts" className="mt-3 font-script text-6xl text-olive sm:text-7xl">
        {gifts.title}
      </h2>

      <p className="mx-auto mt-8 max-w-prose leading-relaxed text-ink-soft">
        {gifts.body}
      </p>

      <a
        href={gifts.ctaHref}
        className="tracking-label mt-10 inline-block border border-ink/45 px-8 py-3 text-xs text-ink transition-colors hover:bg-ink hover:text-cream-light"
      >
        {gifts.ctaLabel}
      </a>

      <p className="mt-12 font-script text-3xl text-ink-soft">{gifts.closing}</p>
    </section>
  );
}
