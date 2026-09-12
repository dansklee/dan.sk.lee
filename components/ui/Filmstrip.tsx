"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Swipeable filmstrip carousel, carried over from the prototype.
 *
 * Three decisions from its design notes are load-bearing:
 *  - Frames butt edge to edge with no gap, so the row reads as one strip of
 *    film rather than separate cards.
 *  - Each frame is 78% of the viewport, so the next one peeks in and it is
 *    obvious there is more to swipe.
 *  - A seamless strip has no card edges to count, so a position indicator
 *    carries the information instead: the thumb's width is the share on
 *    screen, its offset is how far through you are.
 *
 * Above `md` there is room for everything at once and it reverts to a grid,
 * where the indicator would be meaningless.
 */
export function Filmstrip({
  children,
  label,
  columns = 3,
  hint = "Swipe for more",
  seamless = true,
}: {
  children: React.ReactNode;
  label: string;
  columns?: 2 | 3;
  hint?: string;
  /** Photographs butt edge to edge; framed cards need room to read as cards. */
  seamless?: boolean;
}) {
  const stripRef = useRef<HTMLUListElement>(null);
  const [thumb, setThumb] = useState<{ width: number; offset: number } | null>(
    null,
  );
  const [hintSpent, setHintSpent] = useState(false);

  const update = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const scrollable = strip.scrollWidth - strip.clientWidth;
    if (scrollable <= 1) {
      // Laid out as a grid — there is nothing left to indicate.
      setThumb(null);
      return;
    }

    const ratio = strip.clientWidth / strip.scrollWidth;
    const progress = strip.scrollLeft / scrollable;

    setThumb({ width: ratio * 100, offset: (progress * (1 - ratio) * 100) / ratio });
    if (strip.scrollLeft > 8) setHintSpent(true);
  }, []);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        update();
      });
    };

    strip.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    // Fonts and images shift the scroll width after first paint.
    const observer = new ResizeObserver(update);
    observer.observe(strip);
    update();

    return () => {
      strip.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, [update]);

  const gridAtMd = columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
  const gap = seamless ? "gap-0" : "gap-4 md:gap-10";

  return (
    <div>
      <ul
        ref={stripRef}
        aria-label={label}
        className={`-mx-5 grid ${gap} snap-x snap-mandatory auto-cols-[78%] grid-flow-col overflow-x-auto overscroll-x-contain px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-auto md:grid-flow-row ${gridAtMd} md:auto-cols-auto md:overflow-x-visible md:px-0`}
      >
        {children}
      </ul>

      {/* Only meaningful while the strip actually scrolls. */}
      {thumb && (
        <div className="mt-5 grid justify-items-center gap-3">
          {/* Rail and thumb are siblings: opacity on a shared parent would
              dim the thumb along with the rail and hide the indicator. */}
          <div className="relative h-0.5 w-[min(9rem,40%)]">
            <span className="absolute inset-0 bg-current opacity-25" />
            <span
              className="absolute left-0 top-0 h-full bg-current transition-transform duration-[90ms] ease-linear"
              style={{
                width: `${thumb.width}%`,
                transform: `translateX(${thumb.offset}%)`,
              }}
            />
          </div>
          <p
            className={`tracking-label text-step--2 transition-opacity duration-[400ms] ease-out-cubic ${
              hintSpent ? "opacity-0" : "opacity-70"
            }`}
            aria-hidden="true"
          >
            {hint}
          </p>
        </div>
      )}
    </div>
  );
}
