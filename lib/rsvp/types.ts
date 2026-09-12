/**
 * RSVP domain types.
 *
 * Adapted from Matthew14/Wedding (MIT License)
 * https://github.com/Matthew14/Wedding
 *
 * Generalised here: the upstream model hardcoded a villa-accommodation
 * question. That is represented as an optional extras bag instead, so the
 * shape survives whatever the final design asks for.
 *
 * Deliberately dependency-free so it ports to any framework.
 */

/** Attendance is tracked per named person, not per party. */
export interface Invitee {
  id: string;
  firstName: string;
  lastName: string;
  /** The primary invitee is who the invitation is addressed to. */
  isPrimary: boolean;
}

/** One household/party, unlocked by a single invite code. */
export interface Invitation {
  id: string;
  /** 6-character alphanumeric, uppercase. */
  code: string;
  invitees: Invitee[];
  /** Party may bring an unnamed plus-one. */
  allowsPlusOne: boolean;
}

export type AttendanceStatus = "attending" | "declined";

export interface RsvpSubmission {
  invitationId: string;
  status: AttendanceStatus;
  /** Per-invitee attendance. Only meaningful when status is "attending". */
  attending: Record<string, boolean>;
  plusOneName?: string;
  dietaryRestrictions?: string;
  songRequest?: string;
  travelPlans?: string;
  message?: string;
  submittedAt: string;
}

/** Parsed from an invite URL slug such as "alex-sam-AB12CD". */
export interface ParsedInviteSlug {
  names: string[];
  code: string;
}
