import { Ornament } from "@/components/ui/Ornament";
import { details } from "@/data/wedding";

export function Details() {
  return (
    <section className="bg-olive px-[var(--sp-5)] py-[var(--sp-8)] md:py-[var(--sp-9)]" aria-label="Guest information">
      <div className="mx-auto max-w-prose text-center text-cream-light">
        {details.map((block, index) => (
          <div key={block.title}>
            {index > 0 && <Ornament className="my-12 text-cream-light/70" />}

            <h2
              className="font-script text-[calc(var(--step-2)*var(--script-bump))]"
              data-reveal
            >
              {block.title}
            </h2>

            <div className="mt-5 space-y-5 leading-relaxed" data-reveal>
              {block.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
