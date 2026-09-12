"use client";

import { useEffect, useState } from "react";

export interface PageRef {
  id: string;
  label: string;
}

/**
 * The floating pill of dots from the comps. The active page's dot stretches
 * into a lozenge. Each dot is a real button so the pages stay reachable by
 * keyboard and screen reader, which a decorative dot row would not be.
 */
export function PageNav({ pages }: { pages: PageRef[] }) {
  const [activeId, setActiveId] = useState(pages[0]?.id ?? "");

  useEffect(() => {
    // Ordered by position, not by however `pages` happens to be written, so
    // the picker and the bottom-of-document case cannot silently disagree
    // with the DOM.
    const sections = pages
      .map((page) => document.getElementById(page.id))
      .filter((el): el is HTMLElement => el !== null)
      .sort((a, b) => a.offsetTop - b.offsetTop);

    if (sections.length === 0) return;

    /*
      Driven by position rather than an IntersectionObserver ratio. A callback
      only reports the entries that crossed a threshold, so "whichever is
      showing most" was comparing an incomplete set; and these pages are many
      times taller than the viewport, so the visible share of the tallest never
      reliably clears a fixed threshold at all.

      Asking which section the middle of the screen is currently inside has
      neither problem, and is what the dots actually mean.
    */
    let queued = false;

    const pick = () => {
      const midpoint = window.scrollY + window.innerHeight / 2;

      let current = sections[0];
      for (const section of sections) {
        if (section.offsetTop <= midpoint) current = section;
      }

      // The last page can be shorter than half a viewport; at the very bottom
      // of the document it is the one being looked at.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;

      setActiveId(atBottom ? sections[sections.length - 1].id : current.id);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        pick();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    pick();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pages]);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  return (
    <nav
      aria-label="Page sections"
      className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-4"
    >
      <ul className="pointer-events-auto flex items-center gap-1 rounded-full bg-white/90 px-3 shadow-[0_8px_30px_rgba(40,36,28,0.18)] backdrop-blur">
        {pages.map((page) => {
          const isActive = page.id === activeId;
          return (
            <li key={page.id}>
              <button
                type="button"
                onClick={() => goTo(page.id)}
                aria-label={page.label}
                aria-current={isActive ? "true" : undefined}
                /* The dot is small by design, so the button carries the 48px
                   target around it rather than shrinking to the dot. */
                className="flex min-h-tap min-w-[1.75rem] items-center justify-center"
              >
                <span
                  className={`block h-3 rounded-full transition-all duration-300 ${
                    isActive ? "w-9 bg-ink-soft" : "w-3 bg-ink/25"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
