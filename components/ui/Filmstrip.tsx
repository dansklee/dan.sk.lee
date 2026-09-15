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
  gapClass = "gap-0",
}: {
  children: React.ReactNode;
  label: string;
  columns?: 2 | 3;
  hint?: string;
  /**
   * Grid gap. Given as a percentage of the container so it holds the comp's
   * proportion at any width, since the comps fix the gap relative to the
   * frame rather than in pixels.
   */
  gapClass?: string;
}) {
  const stripRef = useRef<HTMLUListElement>(null);
  const [thumb, setThumb] = useState<{ width: number; offset: number } | null>(
    null,
  );
  const [hintSpent, setHintSpent] = useState(false);

  const update = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) return;

    /*
      Whether this strip scrolls is decided by CSS, not by arithmetic: at the
      grid breakpoint the columns round up to a few pixels wider than the
      container, which is enough to read as "scrollable" and leave a dead
      indicator sitting under a grid. Ask the computed style instead.
    */
    const scrolls = getComputedStyle(strip).overflowX !== "visible";
    const scrollable = strip.scrollWidth - strip.clientWidth;

    if (!scrolls || scrollable <= 1) {
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

    /*
      Photographs arrive after first paint and change the strip's scroll width
      without changing its own border box, so watching only the strip leaves a
      stale indicator — visible as "Swipe for more" under a desktop grid that
      does not scroll. Watch the frames too, and catch each image as it lands.
      `load` does not bubble, hence the capture phase.
    */
    const observer = new ResizeObserver(update);
    observer.observe(strip);
    Array.from(strip.children).forEach((child) => observer.observe(child));
    strip.addEventListener("load", update, true);

    /*
      None of the above reliably fires once the grid settles: the frames are
      fixed-ratio so they never resize, and a `fill` image is absolutely
      positioned so loading one changes nothing's box. Measured once too early,
      the indicator sticks — visible as "Swipe for more" under a desktop grid
      that does not scroll. So re-measure unconditionally after layout, again
      once everything has loaded, and whenever the grid breakpoint flips.
    */
    const frame = requestAnimationFrame(() => requestAnimationFrame(update));
    window.addEventListener("load", update);

    const wide = window.matchMedia("(min-width: 768px)");
    wide.addEventListener("change", update);

    update();

    return () => {
      strip.removeEventListener("scroll", onScroll);
      strip.removeEventListener("load", update, true);
      window.removeEventListener("resize", update);
      window.removeEventListener("load", update);
      wide.removeEventListener("change", update);
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [update]);

  const gridAtMd = columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

  return (
    <div>
      <ul
        ref={stripRef}
        aria-label={label}
        className={`-mx-[var(--sp-5)] grid ${gapClass} snap-x snap-mandatory auto-cols-[78%] grid-flow-col overflow-x-auto overscroll-x-contain px-[var(--sp-5)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-auto md:grid-flow-row ${gridAtMd} md:auto-cols-auto md:overflow-x-visible md:px-0`}
      >
        {children}
      </ul>

      {/* Only meaningful while the strip actually scrolls. */}
      {thumb && (
        <div className="mt-5 grid justify-items-center gap-3">
          {/* Rail and thumb are siblings: opacity on a shared parent would
              dim the thumb along with the rail and hide the indicator. */}
          {/* 2px at 25% opacity was there but nobody saw it. Taller rail,
              stronger track, so the thing reads as a control. */}
          <div className="relative h-[3px] w-[min(11rem,52%)]">
            <span className="absolute inset-0 bg-current opacity-30" />
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
