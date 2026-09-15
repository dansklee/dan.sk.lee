"use client";

import { useEffect, useState, type ReactNode } from "react";
import { mapsUrl } from "@/lib/maps";

/**
 * An address that opens the guest's own maps app.
 *
 * The server cannot know the device, so this renders the Google Maps URL — the
 * one that works everywhere — and swaps to maps.apple.com once mounted on an
 * Apple device. Rendering the Apple URL first and correcting it would give
 * Android a broken link for the first paint; this way the fallback is the
 * universal one.
 */
export function MapLink({
  query,
  label,
  className = "",
  children,
}: {
  query: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const [href, setHref] = useState(() => mapsUrl(query, ""));

  useEffect(() => {
    setHref(mapsUrl(query));
  }, [query]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`group inline-flex items-start gap-1.5 underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current ${className}`}
    >
      <span>{children}</span>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-[0.15em] h-[1em] w-[1em] shrink-0 opacity-70"
      >
        <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.6" />
      </svg>
    </a>
  );
}
