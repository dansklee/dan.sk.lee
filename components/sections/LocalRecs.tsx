import Image from "next/image";

import { recommendations } from "@/data/wedding";

export function LocalRecs() {
  return (
    <section className="bg-olive px-6 py-20 sm:py-28" aria-labelledby="local-recs">
      <h2
        id="local-recs"
        className="mx-auto max-w-lg text-center font-display text-3xl leading-tight tracking-[0.08em] text-cream-light sm:text-4xl"
      >
        LOCAL RECOMMENDATIONS
      </h2>

      <p className="mx-auto mt-6 max-w-sm text-center text-sm leading-relaxed text-cream-light/90">
        If you&rsquo;re making a weekend out of it, there&rsquo;s plenty to
        explore around the area:
      </p>

      <ul className="mx-auto mt-14 grid max-w-2xl gap-10 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-14">
        {recommendations.map((place) => (
          <li
            key={place.name}
            /* Double hairline frame from the comps: outer border plus an inset ring. */
            className="border border-gilt/70 p-1.5"
          >
            <div className="flex h-full flex-col items-center border border-gilt/50 px-5 py-7 text-center text-cream-light">
              <h3 className="font-script text-2xl leading-tight">{place.name}</h3>

              <div className="relative mt-6 aspect-[3/4] w-full max-w-[11rem] overflow-hidden bg-olive-deep">
                <Image
                  src={place.image}
                  alt={place.name}
                  fill
                  sizes="(min-width: 640px) 22vw, 60vw"
                  className="object-cover"
                />
              </div>

              {place.address && (
                <p className="mt-6 text-xs italic text-cream-light/85">
                  {place.address}
                </p>
              )}

              <p className="mt-3 text-xs italic leading-relaxed text-cream-light/85">
                {place.blurb}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
