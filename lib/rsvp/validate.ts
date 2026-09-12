/**
 * RSVP validation rules, kept free of the DOM so they can be tested directly.
 * Adapted from the prototype's lib.js.
 *
 * Two conditional branches, both deliberate:
 *  - Declining skips every question below the attendance choice. Those inputs
 *    are collapsed and unreachable, so validating them would raise errors
 *    pointing at markup the guest cannot see.
 *  - The "specify" box only matters when the guest said yes to restrictions.
 */

import type { RsvpFormState } from "./types";

export type RsvpFieldKey =
  | "names"
  | "attending"
  | "ceremony"
  | "reception"
  | "dietary"
  | "dietaryNotes";

/** The order errors are reported in, so focus lands on the topmost problem. */
export const FIELD_ORDER: RsvpFieldKey[] = [
  "names",
  "attending",
  "ceremony",
  "reception",
  "dietary",
  "dietaryNotes",
];

export type RsvpErrors = Partial<Record<RsvpFieldKey, string>>;

/**
 * Mirrors `sanitize_` in apps-script/Code.gs. Checking only the length let a
 * tag-only name like "<b></b>" pass here and be rejected there, which arrives
 * as a form-level error with no field marked.
 */
const clean = (value: string) =>
  value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

export function validateRsvp(state: RsvpFormState): {
  valid: boolean;
  errors: RsvpErrors;
} {
  const errors: RsvpErrors = {};

  // Matches MIN_NAMES in apps-script/Code.gs: a rule the server enforces but
  // the client does not means a rejection with no field marked.
  if (clean(state.names).length < 2) {
    errors.names = "Please tell us who you are.";
  }

  if (state.attending === null) {
    errors.attending = "Please let us know if you can join us.";
  }

  // Everything below here is for guests who are coming.
  if (state.attending === "accepts") {
    if (state.ceremony === null) {
      errors.ceremony = "Please answer yes or no.";
    }
    if (state.reception === null) {
      errors.reception = "Please answer yes or no.";
    }
    if (state.dietary === null) {
      errors.dietary = "Please answer yes or no.";
    } else if (state.dietary === "yes" && !clean(state.dietaryNotes)) {
      errors.dietaryNotes = "Please tell us what to avoid.";
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/** "Alex & Sam Lee" → "Alex", for the personalised confirmation. */
export function firstName(names: string): string {
  return clean(names).split(/[\s&,]+/)[0] ?? "";
}
