/**
 * Invite-link helpers.
 *
 * Adapted from Matthew14/Wedding (MIT License)
 * https://github.com/Matthew14/Wedding
 *
 * Invite URLs read as `/rsvp/alex-sam-AB12CD`: names up front so the link
 * feels personal, with the code always the trailing 6 alphanumerics.
 */

import type { ParsedInviteSlug, RsvpSubmission } from "./types";

export const INVITE_CODE_LENGTH = 6;

/** Shortest valid slug: one name, a hyphen, and the code. */
const MIN_SLUG_LENGTH = INVITE_CODE_LENGTH + 2;

const CODE_PATTERN = new RegExp(`^[A-Za-z0-9]{${INVITE_CODE_LENGTH}}$`);

/**
 * Format guest names for display.
 *
 * ["Alex"]              -> "Alex"
 * ["Alex", "Sam"]       -> "Alex & Sam"
 * ["Alex", "Sam", "Jo"] -> "Alex, Sam & Jo"
 */
export function formatGuestNames(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

/**
 * Parse an invite slug into its names and code.
 * Returns null when the slug is malformed, so callers can 404 cleanly
 * without leaking whether a code exists.
 */
export function parseInviteSlug(slug: string): ParsedInviteSlug | null {
  if (!slug || slug.length < MIN_SLUG_LENGTH) return null;

  const parts = slug.split("-").filter((part) => part.length > 0);
  if (parts.length < 2) return null;

  const code = parts[parts.length - 1];
  if (!CODE_PATTERN.test(code)) return null;

  const names = parts.slice(0, -1);
  if (names.length === 0) return null;

  return { names, code: code.toUpperCase() };
}

/** Build the canonical invite slug for a party. */
export function buildInviteSlug(firstNames: string[], code: string): string {
  const slugNames = firstNames
    .map((name) => name.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter((name) => name.length > 0);

  return [...slugNames, code.toUpperCase()].join("-");
}

/**
 * Cross-field rule the upstream form enforced: accepting an invitation is
 * only coherent if at least one named guest is actually coming.
 *
 * The backend re-checks this — never rely on the client alone.
 */
export function validateSubmission(
  submission: Pick<RsvpSubmission, "status" | "attending">,
): string | null {
  if (submission.status !== "attending") return null;

  return submission.attending.length > 0
    ? null
    : "Select at least one guest, or decline the invitation.";
}
