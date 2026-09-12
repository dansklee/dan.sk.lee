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
    const sections = pages
      .map((page) => document.getElementById(page.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pages are taller than the viewport, so pick whichever is showing
        // most rather than trusting a single threshold crossing.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) setActiveId(visible.target.id);
      },
      { threshold: [0.15, 0.35, 0.6], rootMargin: "-10% 0px -10% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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
      className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4"
    >
      <ul className="pointer-events-auto flex items-center gap-3 rounded-full bg-white/90 px-6 py-4 shadow-[0_8px_30px_rgba(40,36,28,0.18)] backdrop-blur">
        {pages.map((page) => {
          const isActive = page.id === activeId;
          return (
            <li key={page.id}>
              <button
                type="button"
                onClick={() => goTo(page.id)}
                aria-label={page.label}
                aria-current={isActive ? "true" : undefined}
                className={`block h-3 rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-9 bg-ink-soft"
                    : "w-3 bg-ink/25 hover:bg-ink/45"
                }`}
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
