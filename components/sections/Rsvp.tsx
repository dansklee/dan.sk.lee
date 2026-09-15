import { RsvpForm } from "@/components/RsvpForm";
import { rsvpCopy } from "@/data/wedding";

export function Rsvp() {
  return (
    <section
      className="relative overflow-hidden bg-olive-deep"
      aria-labelledby="rsvp-heading"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bg-rsvp.jpg')" }}
        aria-hidden="true"
      />
      <div className="photo-scrim absolute inset-0" aria-hidden="true" />

      <div className="relative px-[var(--sp-5)] py-[var(--sp-8)] md:py-[var(--sp-9)]">
        <h2
          id="rsvp-heading"
          className="text-center font-display text-step-3 tracking-[0.1em] text-cream-light"
          data-reveal
        >
          {rsvpCopy.title}
        </h2>
        <p className="mt-3 text-center text-step--1 text-cream-light/90" data-reveal>
          {rsvpCopy.deadline}
        </p>

        <div
          className="mx-auto mt-10 w-full max-w-md shadow-[0_20px_60px_rgba(24,22,16,0.35)]"
          data-reveal
        >
          <RsvpForm />
        </div>
      </div>
    </section>
  );
}
