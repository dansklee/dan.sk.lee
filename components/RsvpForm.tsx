"use client";

import { useId, useRef, useState } from "react";

import { rsvpCopy } from "@/data/wedding";
import { submitRsvp } from "@/lib/rsvp/client";
import {
  FIELD_ORDER,
  firstName,
  validateRsvp,
  type RsvpErrors,
  type RsvpFieldKey,
} from "@/lib/rsvp/validate";
import type { RsvpFormState, YesNo } from "@/lib/rsvp/types";

const ENDPOINT = process.env.NEXT_PUBLIC_RSVP_ENDPOINT ?? "";

const EMPTY: RsvpFormState = {
  names: "",
  attending: null,
  ceremony: null,
  reception: null,
  dietary: null,
  dietaryNotes: "",
};

const YES_NO: Array<{ value: YesNo; label: string }> = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const toBool = (value: YesNo | null) => (value === null ? null : value === "yes");

function ErrorLine({ id, message }: { id: string; message?: string }) {
  return (
    <p
      id={id}
      hidden={!message}
      className="mt-2 text-step--1 text-[#8a3a24]"
    >
      {message}
    </p>
  );
}

/**
 * A collapsed branch stays in the DOM but goes `inert`: a hidden panel that
 * still holds focusable inputs traps keyboard users in invisible fields, and a
 * screen reader would happily announce a question that is not on screen.
 */
function Branch({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div inert={!open} hidden={!open}>
      {children}
    </div>
  );
}

export function RsvpForm() {
  const namesId = useId();
  const notesId = useId();

  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<RsvpFormState>(EMPTY);
  const [errors, setErrors] = useState<RsvpErrors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<RsvpFormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  /** Errors only start following keystrokes after the first failed submit. */
  const liveErrors = useRef(false);

  /*
    The in-flight guard has to be a ref, not the `sending` state. Taps that
    land in the same tick all read the pre-render value of state, so a fast
    double tap got through the disabled button and sent the reply twice.
  */
  const inFlight = useRef(false);

  const accepting = state.attending === "accepts";
  const needsNotes = accepting && state.dietary === "yes";

  function update(patch: Partial<RsvpFormState>) {
    const next = { ...state, ...patch };
    setState(next);
    if (!liveErrors.current) return;

    // Errors follow keystrokes only once something has been reported, and only
    // for questions already flagged — a branch that just unfolded should not
    // arrive pre-scolded for answers the guest has not had a chance to give.
    const fresh = validateRsvp(next).errors;
    setErrors((shown) =>
      Object.fromEntries(
        Object.keys(shown)
          .filter((key) => fresh[key as RsvpFieldKey])
          .map((key) => [key, fresh[key as RsvpFieldKey]]),
      ),
    );
  }

  function focusFirstError(found: RsvpErrors) {
    const firstBad = FIELD_ORDER.find((key) => found[key]);
    if (!firstBad) return;

    const form = formRef.current;
    const target =
      form?.querySelector<HTMLElement>(`[data-field="${firstBad}"] input`) ?? null;

    target?.focus({ preventScroll: true });
    form
      ?.querySelector(`[data-field="${firstBad}"]`)
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (inFlight.current) return;

    setFormError(null);
    const { valid, errors: found } = validateRsvp(state);
    liveErrors.current = true;
    setErrors(found);

    if (!valid) {
      focusFirstError(found);
      return;
    }

    inFlight.current = true;
    setSending(true);

    try {
      const result = await submitRsvp(
        {
          names: state.names.trim(),
          attending: state.attending!,
          ceremony: accepting ? toBool(state.ceremony) : null,
          reception: accepting ? toBool(state.reception) : null,
          dietaryRestrictions: accepting ? toBool(state.dietary) : null,
          dietaryNotes: needsNotes ? state.dietaryNotes.trim() : "",
        },
        ENDPOINT,
      );

      if (result.ok) {
        setSent(state);
        return;
      }
      setFormError(result.message);
    } catch {
      // Nothing should reach here, but a guest left staring at a disabled
      // "Sending" button with no way to retry is the worst possible ending.
      setFormError("Something went wrong sending that. Please try again.");
    } finally {
      setSending(false);
      inFlight.current = false;
    }
  }

  if (sent) {
    const coming = sent.attending === "accepts";
    const name = firstName(sent.names);

    return (
      <div
        className="bg-cream-paper px-7 py-16 text-center sm:px-10"
        role="status"
        tabIndex={-1}
      >
        <p className="font-script text-[calc(var(--step-2)*var(--script-bump))] text-ink">
          {coming ? "See you there" : "Thank you for telling us"}
        </p>
        <p className="mt-4 text-step--1 leading-relaxed text-ink-soft">
          {coming
            ? `We've got you down${name ? `, ${name}` : ""}. We can't wait to celebrate with you.`
            : `We'll miss you${name ? `, ${name}` : ""}. Thank you for letting us know.`}
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="bg-cream-paper px-6 py-8 text-left sm:px-10 sm:py-11"
    >
      <p className="text-step-0 leading-snug text-ink">{rsvpCopy.intro}</p>

      <div className="mt-7" data-field="names">
        <label htmlFor={namesId} className="block text-step--1 text-ink-soft">
          Your name(s)
        </label>
        <input
          id={namesId}
          type="text"
          value={state.names}
          onChange={(event) => update({ names: event.target.value })}
          autoComplete="name"
          maxLength={200}
          aria-invalid={errors.names ? true : undefined}
          aria-describedby={errors.names ? `${namesId}-error` : undefined}
          /* Never below 16px: iOS Safari zooms the viewport otherwise, and does
             not zoom back out. */
          className="mt-2 min-h-tap w-full border border-ink/25 bg-white px-3 text-[16px] text-ink outline-none focus:border-olive focus:ring-1 focus:ring-olive"
        />
        <ErrorLine id={`${namesId}-error`} message={errors.names} />
      </div>

      <Choice
        field="attending"
        legend="Will you be attending our wedding?"
        value={state.attending}
        error={errors.attending}
        onChange={(value) => update({ attending: value })}
        options={[
          { value: "accepts", label: "Joyfully accepts" },
          { value: "declines", label: "Regretfully declines" },
        ]}
      />

      {/* The comp shows every question at once; they only apply to guests who
          are coming, so they unfold once the invitation is accepted. */}
      <Branch open={accepting}>
        <Choice
          field="ceremony"
          legend="Attending ceremony?"
          value={state.ceremony}
          error={errors.ceremony}
          onChange={(value) => update({ ceremony: value })}
          options={YES_NO}
        />
        <Choice
          field="reception"
          legend="Attending reception?"
          value={state.reception}
          error={errors.reception}
          onChange={(value) => update({ reception: value })}
          options={YES_NO}
        />
        <Choice
          field="dietary"
          legend="Any dietary restrictions?"
          value={state.dietary}
          error={errors.dietary}
          onChange={(value) => update({ dietary: value })}
          options={YES_NO}
        />

        <Branch open={needsNotes}>
          <div className="mt-6" data-field="dietaryNotes">
            <label htmlFor={notesId} className="block text-step--1 text-ink-soft">
              If yes, please specify here.
            </label>
            <input
              id={notesId}
              type="text"
              value={state.dietaryNotes}
              onChange={(event) => update({ dietaryNotes: event.target.value })}
              maxLength={1000}
              aria-invalid={errors.dietaryNotes ? true : undefined}
              aria-describedby={errors.dietaryNotes ? `${notesId}-error` : undefined}
              className="mt-2 min-h-tap w-full border border-ink/25 bg-white px-3 text-[16px] text-ink outline-none focus:border-olive focus:ring-1 focus:ring-olive"
            />
            <ErrorLine id={`${notesId}-error`} message={errors.dietaryNotes} />
          </div>
        </Branch>
      </Branch>

      {formError && (
        <p role="alert" className="mt-6 text-step--1 text-[#8a3a24]">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="tracking-label hover-dim mt-8 min-h-tap w-full bg-olive px-4 text-step--2 text-cream-light transition-opacity disabled:opacity-60"
      >
        {sending ? "Sending" : "Submit"}
      </button>

      <p className="mt-4 text-center text-step--2 leading-relaxed text-ink-soft/80">
        {rsvpCopy.finePrint}
      </p>
    </form>
  );
}

/** Full-width tinted bars, as the comps draw them rather than radio dots. */
function Choice<T extends string>({
  field,
  legend,
  value,
  options,
  error,
  onChange,
}: {
  field: RsvpFieldKey;
  legend: string;
  value: T | null;
  options: Array<{ value: T; label: string }>;
  error?: string;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset
      className="mt-6"
      data-field={field}
      aria-describedby={error ? `${field}-error` : undefined}
      aria-invalid={error ? true : undefined}
    >
      <legend className="text-step--1 text-ink-soft">{legend}</legend>
      <div className="mt-2 space-y-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              /* The radio itself is visually hidden, so focus has to show on
                 the bar the guest can actually see. */
              className={`flex min-h-tap cursor-pointer items-center px-3 text-step--1 transition-colors duration-[260ms] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-olive ${
                selected
                  ? "bg-olive text-cream-light"
                  : "bg-ink/[0.055] text-ink-soft"
              }`}
            >
              <input
                type="radio"
                name={field}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
      <ErrorLine id={`${field}-error`} message={error} />
    </fieldset>
  );
}
