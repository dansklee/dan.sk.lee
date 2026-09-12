import Image from "next/image";

import { gallery } from "@/data/wedding";

export function Gallery() {
  return (
    <section className="bg-cream-light px-6 py-20 sm:py-28" aria-label="Photographs">
      <ul className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3 sm:gap-8">
        {gallery.map((photo) => (
          <li key={photo.src}>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 640px) 30vw, 90vw"
                className="object-cover"
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
