import { closing, wedding } from "@/data/wedding";

export function Closing() {
  return (
    <footer className="bg-olive px-6 pb-32 pt-14 text-center text-cream-light">
      {closing.lines.map((line) => (
        <p key={line} className="text-sm leading-relaxed">
          {line}
        </p>
      ))}

      <p className="mt-6 font-script text-3xl">{wedding.couple}</p>
    </footer>
  );
}
