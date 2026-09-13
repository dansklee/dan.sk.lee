import { story, wedding } from "@/data/wedding";

/** "Our Story" follows the curve of the arch, as in the comps. */
function ArchedTitle({ text }: { text: string }) {
  return (
    <svg
      viewBox="0 0 320 76"
      className="mx-auto w-56 sm:w-64"
      role="img"
      aria-label={text}
    >
      <defs>
        <path id="story-arc" d="M 26 66 A 400 400 0 0 1 294 66" fill="none" />
      </defs>
      <text
        className="fill-ink font-display"
        fontSize="23"
        letterSpacing="6"
        textAnchor="middle"
      >
        <textPath href="#story-arc" startOffset="50%">
          {text.toUpperCase()}
        </textPath>
      </text>
    </svg>
  );
}

export function OurStory() {
  return (
    <section className="bg-cream px-[var(--sp-5)] py-[var(--sp-8)] md:py-[var(--sp-9)]" aria-label={story.title}>
      <div className="mx-auto w-full max-w-[26rem]">
        <div
          className="rounded-[13rem] border border-olive-light/70 bg-cream-paper px-7 py-12 text-center sm:px-12 sm:py-16"
          data-reveal
        >
          <ArchedTitle text={story.title} />

          <div className="mt-6 space-y-5 text-step-0 leading-relaxed text-ink-soft">
            {story.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          <p className="mt-8 text-step-0 text-ink-soft">{story.signOff}</p>
          <p className="mt-4 font-script text-[calc(var(--step-2)*var(--script-bump))] text-ink">
            {wedding.couple}
          </p>
        </div>
      </div>
    </section>
  );
}
