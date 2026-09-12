import { Countdown } from "@/components/Countdown";
import { wedding } from "@/data/wedding";

export function Hero() {
  return (
    <section
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-olive-deep"
      aria-labelledby="hero-heading"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bg-hero.svg')" }}
        aria-hidden="true"
      />
      <div className="photo-scrim absolute inset-0" aria-hidden="true" />

      <div className="relative px-6 pb-24 pt-16 text-center text-cream-light">
        <h1
          id="hero-heading"
          className="font-script text-6xl leading-[1.15] sm:text-7xl md:text-8xl"
        >
          {wedding.couple}
        </h1>

        <p className="tracking-label mt-5 text-xs sm:text-sm">
          {wedding.location}
        </p>
        <p className="tracking-label mt-3 font-mono text-[0.65rem] sm:text-xs">
          {wedding.dateLabel}
        </p>

        <Countdown targetISO={wedding.dateISO} className="mt-10" />
      </div>
    </section>
  );
}
