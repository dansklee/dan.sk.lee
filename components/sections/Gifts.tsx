import { gifts, wedding } from "@/data/wedding";
import { formatAmount, venmoUrl } from "@/lib/venmo";

/**
 * Four amounts instead of a single link to an empty payment screen.
 *
 * "How much should we give?" is the awkward part of this page, and leaving a
 * guest to answer it alone is what makes people close the tab. Naming the
 * amounts turns a decision into a choice.
 */
export function Gifts() {
  const note = `Wedding gift — ${wedding.couple}`;

  return (
    <section
      className="bg-cream-light px-[var(--sp-5)] py-[var(--sp-8)] text-center md:py-[var(--sp-9)]"
      aria-labelledby="gifts"
    >
      <p className="tracking-label font-display text-step--1 text-ink" data-reveal>
        {gifts.eyebrow}
      </p>

      <h2
        id="gifts"
        className="mt-3 font-script text-[calc(var(--step-3)*var(--script-bump))] text-olive"
        data-reveal
      >
        {gifts.title}
      </h2>

      <p className="mx-auto mt-8 max-w-prose leading-relaxed text-ink-soft" data-reveal>
        {gifts.body}
      </p>

      <ul className="mx-auto mt-10 grid w-full max-w-sm gap-3 text-left" data-reveal>
        {gifts.tiers.map((tier) => {
          const featured = "featured" in tier && tier.featured;
          const aside = "aside" in tier ? tier.aside : undefined;

          return (
            <li key={tier.label}>
              <a
                href={venmoUrl(gifts.venmoHandle, tier.amount, note)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={
                  tier.amount === null
                    ? `Give another amount on Venmo — ${tier.label}`
                    : `Give ${formatAmount(tier.amount)} on Venmo — ${tier.label}`
                }
                className={`flex min-h-tap items-center gap-4 px-4 py-3 transition-colors ${
                  featured
                    ? "bg-olive text-cream-light"
                    : "border border-ink/20 text-ink hover:border-ink/45"
                }`}
              >
                <span
                  className={`font-display text-step-1 tabular-nums ${
                    featured ? "" : "text-olive"
                  }`}
                >
                  {tier.amount === null ? "Other" : formatAmount(tier.amount)}
                </span>

                <span className="flex-1 text-step--1 leading-snug">
                  {tier.label}
                </span>

                {aside && (
                  <span className="tracking-label shrink-0 text-step--2 opacity-75">
                    {aside}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-step--2 text-ink-soft" data-reveal>
        Opens Venmo. No account? Just come and dance with us.
      </p>

      <p
        className="mt-12 font-script text-[calc(var(--step-2)*var(--script-bump))] text-ink-soft"
        data-reveal
      >
        {gifts.closing}
      </p>
    </section>
  );
}
