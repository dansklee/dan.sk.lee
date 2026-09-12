import Image from "next/image";

import { Filmstrip } from "@/components/ui/Filmstrip";
import { recommendations } from "@/data/wedding";

export function LocalRecs() {
  return (
    <section className="bg-olive px-5 py-16 text-cream-light sm:py-24" aria-labelledby="local-recs">
      <h2
        id="local-recs"
        className="mx-auto max-w-lg text-center font-display text-step-3-long leading-tight tracking-[0.06em] sm:tracking-[0.08em]"
        data-reveal
      >
        LOCAL RECOMMENDATIONS
      </h2>

      <p
        className="mx-auto mt-5 max-w-sm text-center text-step--1 leading-relaxed opacity-90"
        data-reveal
      >
        If you&rsquo;re making a weekend out of it, there&rsquo;s plenty to
        explore around the area:
      </p>

      <div className="mx-auto mt-12 max-w-2xl">
        <Filmstrip
          label="Local recommendations"
          columns={2}
          gapClass="gap-4 md:gap-[8.4%]"
          hint="Swipe for more"
        >
          {recommendations.map((place) => (
            <li key={place.name} className="snap-center border border-gilt/70 p-1.5">
              <div className="flex h-full flex-col items-center border border-gilt/50 px-5 py-7 text-center">
                <h3 className="font-script text-[calc(var(--step-1)*var(--script-bump))] leading-tight">
                  {place.name}
                </h3>

                <div className="relative mt-5 aspect-[3/4] w-full max-w-[11rem] overflow-hidden bg-olive-deep">
                  <Image
                    src={place.image}
                    alt={place.name}
                    fill
                    sizes="(min-width: 768px) 22vw, 45vw"
                    className="object-cover"
                  />
                </div>

                {place.address && (
                  <p className="mt-5 text-step--2 italic opacity-85">{place.address}</p>
                )}

                <p className="mt-3 text-step--2 italic leading-relaxed opacity-85">
                  {place.blurb}
                </p>
              </div>
            </li>
          ))}
        </Filmstrip>
      </div>
    </section>
  );
}
