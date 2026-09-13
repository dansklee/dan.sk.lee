import Image from "next/image";

import { Filmstrip } from "@/components/ui/Filmstrip";
import { gallery } from "@/data/wedding";

export function Gallery() {
  return (
    <section className="bg-cream-light px-5 py-16 text-ink sm:py-24" aria-label="Photographs">
      {/* 52rem ≈ the comp's 829px row at its 1087px page width. */}
      <div className="mx-auto max-w-[52rem]">
        <Filmstrip
          label="Photographs of Dan and Tien"
          columns={3}
          gapClass="gap-4 md:gap-[11.2%]"
        >
          {gallery.map((photo) => (
            <li key={photo.src} className="snap-center">
              <div
                className="relative aspect-[215/279] w-full overflow-hidden bg-cream"
                data-reveal="photo"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 768px) 30vw, 78vw"
                  quality={85}
                  className="object-cover"
                  /* The comp crops the top of each frame, never the bottom:
                     feet and the dog stay in every one. */
                  style={{ objectPosition: photo.position }}
                />
              </div>
            </li>
          ))}
        </Filmstrip>
      </div>
    </section>
  );
}
