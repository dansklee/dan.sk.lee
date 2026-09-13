/**
 * RSVP types. These mirror the form in the designer's comps field for field,
 * and the columns of the Responses sheet.
 *
 * Dependency-free on purpose so the shape is shared by form, client and docs.
 */

export type Attending = "accepts" | "declines";

export interface RsvpSubmission {
  /** Free text: "the guest(s) named on your invitation". */
  names: string;
  attending: Attending;
  /** Null when declining — the questions are not asked. */
  ceremony: boolean | null;
  reception: boolean | null;
  dietaryRestrictions: boolean | null;
  dietaryNotes: string;
}

/** Error codes the Apps Script backend returns. */
export type RsvpErrorCode =
  | "INVALID_ACTION"
  | "INVALID_BODY"
  | "INVALID_JSON"
  | "INVALID_NAMES"
  | "INVALID_ATTENDING"
  | "INCOMPLETE"
  | "RATE_LIMITED"
  | "BUSY"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "NOT_CONFIGURED";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: RsvpErrorCode; message: string };

export interface RsvpAccepted {
  attending: Attending;
}

export type YesNo = "yes" | "no";

/** What the form holds while it is being filled in. */
export interface RsvpFormState {
  names: string;
  attending: Attending | null;
  ceremony: YesNo | null;
  reception: YesNo | null;
  dietary: YesNo | null;
  dietaryNotes: string;
}
