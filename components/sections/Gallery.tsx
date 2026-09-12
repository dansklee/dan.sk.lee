import Image from "next/image";

import { Filmstrip } from "@/components/ui/Filmstrip";
import { gallery } from "@/data/wedding";

export function Gallery() {
  return (
    <section className="bg-cream-light px-5 py-16 text-ink sm:py-24" aria-label="Photographs">
      <div className="mx-auto max-w-content">
        <Filmstrip label="Photographs of Dan and Tien" columns={3}>
          {gallery.map((photo) => (
            <li key={photo.src} className="snap-center">
              <div
                className="relative aspect-[3/4] w-full overflow-hidden bg-cream"
                data-reveal="photo"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 768px) 30vw, 78vw"
                  className="object-cover"
                />
              </div>
            </li>
          ))}
        </Filmstrip>
      </div>
    </section>
  );
}
