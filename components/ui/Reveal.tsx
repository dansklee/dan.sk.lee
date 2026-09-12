"use client";

import { useEffect } from "react";

/**
 * Scroll reveal, carried over from the prototype.
 *
 * The hidden state lives behind `.has-reveal`, which this only adds once it has
 * an observer and the visitor has not asked for reduced motion — so nothing can
 * end up permanently invisible if the script never runs.
 *
 * A scroll sweep backs up the observer: a fast flick or an anchor jump can move
 * an element past the fold between two frames without ever intersecting.
 */
export function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (targets.length === 0) return;

    // Stagger restarts per section, so a long page does not accumulate delay.
    const seen = new Map<Element, number>();
    targets.forEach((el) => {
      const section = el.closest("section, footer, header") ?? document.body;
      const index = seen.get(section) ?? 0;
      seen.set(section, index + 1);
      el.style.setProperty("--reveal-delay", `${Math.min(index, 6) * 70}ms`);
    });

    document.documentElement.classList.add("has-reveal");

    const show = (el: Element) => el.classList.add("is-in");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );

    targets.forEach((el) => observer.observe(el));

    const sweep = () => {
      targets.forEach((el) => {
        if (el.classList.contains("is-in")) return;
        if (el.getBoundingClientRect().top < window.innerHeight) show(el);
      });
    };

    window.addEventListener("scroll", sweep, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", sweep);
    };
  }, []);

  return null;
}
