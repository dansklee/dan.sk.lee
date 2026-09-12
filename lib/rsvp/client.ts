/**
 * Typed client for the Apps Script RSVP backend.
 */

import type { ApiResult, RsvpAccepted, RsvpSubmission } from "./types";

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

const serverError: ApiResult<never> = {
  ok: false,
  error: "SERVER_ERROR",
  message: "Something went wrong. Please try again.",
};

/**
 * Submit an RSVP.
 *
 * The endpoint is passed in rather than read from an env var here, so this
 * module stays framework-agnostic; the form component supplies it.
 */
export async function submitRsvp(
  submission: RsvpSubmission,
  endpoint: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<ApiResult<RsvpAccepted>> {
  if (!endpoint) {
    return {
      ok: false,
      error: "NOT_CONFIGURED",
      message: "RSVP is not connected yet. Please check back shortly.",
    };
  }

  const payload = {
    action: "rsvp",
    ...submission,
    userAgent:
      typeof navigator === "undefined" ? "" : navigator.userAgent.slice(0, 200),
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      // text/plain keeps this a CORS "simple request". Apps Script does not
      // answer the OPTIONS preflight that application/json would trigger, so
      // the browser would block the call before it was ever sent.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) return serverError;

    // Apps Script can answer 200 with an HTML error page; treat that as a
    // failure rather than letting a parse error escape.
    try {
      return (await response.json()) as ApiResult<RsvpAccepted>;
    } catch {
      return serverError;
    }
  } catch (error) {
    return networkError(error);
  }
}
