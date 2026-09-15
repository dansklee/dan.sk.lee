/**
 * A Venmo link for a wedding gift.
 *
 * `txn=pay` with a recipient opens the app on a phone with the payment sheet
 * already filled in, and falls back to the web profile in a desktop browser.
 * Passing no amount leaves that field for the guest to fill.
 */
export function venmoUrl(handle: string, amount: number | null, note: string) {
  const params = new URLSearchParams({ txn: "pay", note });
  if (amount !== null) params.set("amount", String(amount));
  return `https://venmo.com/${handle}?${params}`;
}

/** $1,000 — grouped, no trailing zeros, because it is always a round number. */
export const formatAmount = (amount: number) =>
  `$${amount.toLocaleString("en-US")}`;
