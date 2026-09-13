import { closing, wedding } from "@/data/wedding";

export function Closing() {
  return (
    <footer className="bg-olive px-[var(--sp-5)] pb-[max(8rem,calc(6rem+env(safe-area-inset-bottom)))] pt-[var(--sp-8)] text-center text-cream-light">
      {closing.lines.map((line) => (
        <p key={line} className="text-step--1 leading-relaxed" data-reveal>
          {line}
        </p>
      ))}

      <p className="mt-6 font-script text-[calc(var(--step-2)*var(--script-bump))]" data-reveal>
        {wedding.couple}
      </p>
    </footer>
  );
}
