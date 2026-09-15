/**
 * A map link that opens the app the guest already uses.
 *
 * Apple devices get maps.apple.com, which iOS hands straight to Maps; everyone
 * else gets Google Maps, which Android hands to its app and a desktop opens in
 * the browser. Both are plain https, so nothing depends on a custom scheme
 * being registered.
 */
export function mapsUrl(query: string, userAgent?: string): string {
  const q = encodeURIComponent(query);
  const ua =
    userAgent ?? (typeof navigator === "undefined" ? "" : navigator.userAgent);

  return /iPhone|iPad|iPod|Macintosh/i.test(ua)
    ? `https://maps.apple.com/?q=${q}`
    : `https://www.google.com/maps/search/?api=1&query=${q}`;
}
