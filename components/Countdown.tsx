"use client";

import { useEffect, useState } from "react";

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
}

function remainingUntil(target: number): Remaining | null {
  const ms = target - Date.now();
  if (ms <= 0) return null;

  const minutes = Math.floor(ms / 60_000);
  return {
    days: Math.floor(minutes / 1440),
    hours: Math.floor((minutes % 1440) / 60),
    minutes: minutes % 60,
  };
}

/**
 * Renders nothing until mounted: the server has no idea what "now" is for the
 * visitor, and rendering a guess would mismatch on hydration.
 */
export function Countdown({
  targetISO,
  className = "",
}: {
  targetISO: string;
  className?: string;
}) {
  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const target = new Date(targetISO).getTime();
    if (Number.isNaN(target)) return;

    // The clock shows minutes, so ticking every second must not re-render
    // every second; keep the previous object unless a figure changed.
    const tick = () =>
      setRemaining((previous) => {
        const next = remainingUntil(target);
        if (!next || !previous) return next;
        return previous.days === next.days &&
          previous.hours === next.hours &&
          previous.minutes === next.minutes
          ? previous
          : next;
      });
    tick();
    setMounted(true);

    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [targetISO]);

  if (!mounted) {
    // Reserve the space so the hero does not jump once the clock appears.
    return <div className={`h-[4.5rem] ${className}`} aria-hidden="true" />;
  }

  if (!remaining) {
    return (
      <p className={`tracking-label font-mono text-sm ${className}`}>
        Today is the day
      </p>
    );
  }

  const units: Array<[number, string]> = [
    [remaining.days, "Days"],
    [remaining.hours, "Hours"],
    [remaining.minutes, "Minutes"],
  ];

  return (
    <div className={className}>
      <dl className="flex items-start justify-center gap-3 font-mono sm:gap-5">
        {units.map(([value, label], index) => (
          <div key={label} className="flex items-start gap-3 sm:gap-5">
            {index > 0 && (
              <span aria-hidden="true" className="pt-1 text-2xl opacity-70">
                :
              </span>
            )}
            <div className="text-center">
              <dd className="text-2xl tabular-nums sm:text-3xl">
                {String(value).padStart(2, "0")}
              </dd>
              <dt className="tracking-label mt-2 text-[0.55rem] opacity-80">
                {label}
              </dt>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
