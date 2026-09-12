import { Ornament } from "@/components/ui/Ornament";
import { venues } from "@/data/wedding";

export function Venues() {
  return (
    <section
      className="relative overflow-hidden bg-olive-deep"
      aria-label="Ceremony and reception"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bg-venues.svg')" }}
        aria-hidden="true"
      />
      <div className="photo-scrim absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-prose px-6 py-24 text-center text-cream-light sm:py-32">
        {venues.map((venue, index) => (
          <div key={venue.name}>
            {index > 0 && <Ornament className="my-12 text-cream-light/70" />}

            <h2 className="font-script text-4xl sm:text-5xl">{venue.name}</h2>

            <p className="mt-5 text-lg leading-relaxed">{venue.venue}</p>

            <address className="mt-6 not-italic leading-relaxed opacity-90">
              {venue.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>

            {venue.note && (
              <p className="mx-auto mt-6 max-w-sm leading-relaxed opacity-90">
                {venue.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
