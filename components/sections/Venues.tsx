import { Ornament } from "@/components/ui/Ornament";
import { venues } from "@/data/wedding";
import { MapLink } from "@/components/ui/MapLink";

export function Venues() {
  return (
    <section
      className="relative overflow-hidden bg-olive-deep"
      aria-label="Ceremony and reception"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bg-venues.jpg')" }}
        aria-hidden="true"
      />
      <div className="photo-scrim absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-prose text-center text-cream-light px-[var(--sp-5)] py-[var(--sp-8)] md:py-[var(--sp-9)]">
        {venues.map((venue, index) => (
          <div key={venue.name}>
            {index > 0 && <Ornament className="my-12 text-cream-light/70" />}

            <h2
              className="font-script text-[calc(var(--step-2)*var(--script-bump))]"
              data-reveal
            >
              {venue.name}
            </h2>

            <p className="mt-5 text-step-1 leading-relaxed" data-reveal>
              {venue.venue}
            </p>

            <address className="mt-6 not-italic leading-relaxed opacity-90" data-reveal>
              {/* The whole address is the link — a guest reading it on a phone
                  wants to open it, not select and paste it somewhere. */}
              <MapLink
                query={`${venue.venue}, ${venue.address.join(", ")}`}
                label={`Open ${venue.venue} in Maps`}
              >
                {/* Every line but the last is its own block; the last stays
                    inline so the pin sits at the end of it. */}
                {venue.address.slice(0, -1).map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                {venue.address[venue.address.length - 1]}
              </MapLink>
            </address>

            {venue.note && (
              <p className="mx-auto mt-6 max-w-sm leading-relaxed opacity-90" data-reveal>
                {venue.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
