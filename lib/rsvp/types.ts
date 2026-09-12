/**
 * RSVP domain types.
 *
 * Adapted from Matthew14/Wedding (MIT License)
 * https://github.com/Matthew14/Wedding
 *
 * Two changes from upstream: the villa-accommodation question is dropped in
 * favour of fields the design calls for, and the invite code doubles as the
 * party's identifier, since the Google Sheets backend has no row ids.
 *
 * Deliberately dependency-free so it ports to any framework.
 */

/** Attendance is tracked per named person, not per party. */
export interface Invitee {
  /** Stable within a party: `${code}-${index}`. Assigned by the backend. */
  id: string;
  firstName: string;
  lastName: string;
  /** The primary invitee is who the invitation is addressed to. */
  isPrimary: boolean;
}

export type AttendanceStatus = "attending" | "declined";

/** A response already on file, so a returning guest can amend it. */
export interface ExistingResponse {
  updatedAt: string;
  status: AttendanceStatus;
  /** Display names, as written to the sheet. */
  attending: string[];
  plusOneName: string;
  dietaryRestrictions: string;
  songRequest: string;
  travelPlans: string;
  message: string;
}

/** One household, unlocked by a single invite code. */
export interface Invitation {
  /** 6-character alphanumeric, uppercase. Also the party's identifier. */
  code: string;
  invitees: Invitee[];
  allowsPlusOne: boolean;
  existingResponse: ExistingResponse | null;
}

export interface RsvpSubmission {
  code: string;
  status: AttendanceStatus;
  /** Invitee ids. Only meaningful when status is "attending". */
  attending: string[];
  plusOneName?: string;
  dietaryRestrictions?: string;
  songRequest?: string;
  travelPlans?: string;
  message?: string;
}

/** Parsed from an invite URL slug such as "alex-sam-AB12CD". */
export interface ParsedInviteSlug {
  names: string[];
  code: string;
}

/** Error codes the Apps Script backend returns. */
export type RsvpErrorCode =
  | "INVALID_ACTION"
  | "INVALID_CODE"
  | "INVALID_BODY"
  | "INVALID_JSON"
  | "INVALID_STATUS"
  | "NOT_FOUND"
  | "NO_GUESTS"
  | "RATE_LIMITED"
  | "BUSY"
  | "SERVER_ERROR"
  | "NETWORK_ERROR";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: RsvpErrorCode; message: string };
