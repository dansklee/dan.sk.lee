/**
 * Typed client for the Apps Script RSVP backend.
 */

import type { ApiResult, RsvpAccepted, RsvpSubmission } from "./types";

const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * AbortSignal.timeout is unsupported before iOS Safari 16; calling it throws,
 * which would otherwise surface as "check your connection" on every attempt,
 * leaving those guests unable to reply at all.
 */
function timeoutSignal(ms: number): { signal: AbortSignal; done: () => void } {
  if (typeof AbortSignal.timeout === "function") {
    return { signal: AbortSignal.timeout(ms), done: () => {} };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(timer) };
}

/**
 * A 200 with an unexpected body must not read as a silent success.
 *
 * The success arm is checked all the way down to `attending`: a bare
 * `{"ok":true}` — a stale deployment, the wrong URL, a proxy's health
 * response — would otherwise thank the guest for a reply nobody recorded,
 * and the narrowing to a required `data` would be a lie.
 */
function isApiResult(value: unknown): value is ApiResult<RsvpAccepted> {
  if (typeof value !== "object" || value === null) return false;
  const result = value as { ok?: unknown; data?: unknown; message?: unknown };

  if (result.ok === true) {
    const data = result.data as { attending?: unknown } | undefined;
    return (
      typeof data === "object" &&
      data !== null &&
      (data.attending === "accepts" || data.attending === "declines")
    );
  }

  return result.ok === false && typeof result.message === "string";
}

function networkError(error: unknown): ApiResult<never> {
  const timedOut =
    error instanceof DOMException &&
    (error.name === "TimeoutError" || error.name === "AbortError");
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

  // Built inside the try: on a browser with neither AbortSignal nor
  // AbortController, constructing it throws, and a throw escaping this
  // function leaves the form with no result to act on.
  let release = () => {};

  try {
    const { signal, done } = timeoutSignal(timeoutMs);
    release = done;

    const response = await fetch(endpoint, {
      method: "POST",
      // text/plain keeps this a CORS "simple request". Apps Script does not
      // answer the OPTIONS preflight that application/json would trigger, so
      // the browser would block the call before it was ever sent.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal,
    });

    if (!response.ok) return serverError;

    // Apps Script can answer 200 with an HTML error page, or with a body that
    // is valid JSON but not our envelope. Either is a failure, not a success.
    try {
      const body: unknown = await response.json();
      return isApiResult(body) ? body : serverError;
    } catch {
      return serverError;
    }
  } catch (error) {
    return networkError(error);
  } finally {
    release();
  }
}
