import { gifts } from "@/data/wedding";

export function Gifts() {
  return (
    <section className="bg-cream-light text-center px-[var(--sp-5)] py-[var(--sp-8)] md:py-[var(--sp-9)]" aria-labelledby="gifts">
      <p className="tracking-label font-display text-step--1 text-ink"
        data-reveal>
        {gifts.eyebrow}
      </p>

      <h2 id="gifts" className="mt-3 font-script text-[calc(var(--step-3)*var(--script-bump))] text-olive"
        data-reveal>
        {gifts.title}
      </h2>

      <p className="mx-auto mt-8 max-w-prose leading-relaxed text-ink-soft"
        data-reveal>
        {gifts.body}
      </p>

      {/* Leaves the site, so it opens in a new tab and says where it goes. */}
      <a
        href={gifts.ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${gifts.ctaLabel} — open Venmo`}
        className="tracking-label hover-dim mt-10 inline-flex min-h-tap items-center border border-ink/45 px-8 text-step--2 text-ink transition-colors"
        data-reveal
      >
        {gifts.ctaLabel}
      </a>

      <p className="mt-12 font-script text-[calc(var(--step-2)*var(--script-bump))] text-ink-soft"
        data-reveal>{gifts.closing}</p>
    </section>
  );
}
