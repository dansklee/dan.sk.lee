/**
 * Typed client for the Apps Script RSVP backend.
 *
 * Framework-agnostic on purpose: it takes the endpoint as an argument rather
 * than reading an env var, so it works unchanged whichever way the site is
 * eventually built.
 */

import type { ApiResult, Invitation, RsvpSubmission } from "./types";

export interface RsvpClientOptions {
  /** The Apps Script Web App /exec URL. */
  endpoint: string;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15_000;

function networkError(error: unknown): ApiResult<never> {
  const timedOut = error instanceof DOMException && error.name === "TimeoutError";
  return {
    ok: false,
    error: "NETWORK_ERROR",
    message: timedOut
      ? "That took too long. Please check your connection and try again."
      : "We could not reach the server. Please try again.",
  };
}

async function readResult<T>(response: Response): Promise<ApiResult<T>> {
  if (!response.ok) {
    return {
      ok: false,
      error: "SERVER_ERROR",
      message: "Something went wrong. Please try again.",
    };
  }

  // Apps Script can answer 200 with an HTML error page; treat that as a failure
  // rather than letting a JSON parse error escape as an unhandled rejection.
  try {
    return (await response.json()) as ApiResult<T>;
  } catch {
    return {
      ok: false,
      error: "SERVER_ERROR",
      message: "Something went wrong. Please try again.",
    };
  }
}

/** Look up a party by invite code, including any response already on file. */
export async function fetchInvitation(
  code: string,
  options: RsvpClientOptions,
): Promise<ApiResult<Invitation>> {
  const url = new URL(options.endpoint);
  url.searchParams.set("action", "invite");
  url.searchParams.set("code", code.toUpperCase());

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });
    return await readResult<Invitation>(response);
  } catch (error) {
    return networkError(error);
  }
}

export interface RsvpAccepted {
  status: string;
  attending: string[];
}

/** Submit or amend a party's RSVP. Re-submitting overwrites the same row. */
export async function submitRsvp(
  submission: RsvpSubmission,
  options: RsvpClientOptions,
): Promise<ApiResult<RsvpAccepted>> {
  const payload = {
    action: "rsvp",
    ...submission,
    code: submission.code.toUpperCase(),
    userAgent:
      typeof navigator === "undefined" ? "" : navigator.userAgent.slice(0, 200),
  };

  try {
    const response = await fetch(options.endpoint, {
      method: "POST",
      // text/plain keeps this a CORS "simple request". Apps Script does not
      // answer the OPTIONS preflight that application/json would trigger, so
      // the browser would block the call before it was ever sent.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });
    return await readResult<RsvpAccepted>(response);
  } catch (error) {
    return networkError(error);
  }
}
