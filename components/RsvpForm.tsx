"use client";

import { useId, useState } from "react";

import { submitRsvp } from "@/lib/rsvp/client";
import type { Attending, RsvpSubmission } from "@/lib/rsvp/types";
import { rsvpCopy } from "@/data/wedding";

const ENDPOINT = process.env.NEXT_PUBLIC_RSVP_ENDPOINT ?? "";

type Status = "idle" | "sending" | "sent";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 first:mt-0">
      <p className="text-sm text-ink-soft">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/** The full-width tinted bars the comps use instead of visible radio dots. */
function ChoiceGroup<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: T | null;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="mt-6">
      <legend className="text-sm text-ink-soft">{legend}</legend>
      <div className="mt-2 space-y-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center rounded-sm px-3 py-2 text-sm transition-colors ${
                selected
                  ? "bg-olive text-cream-light"
                  : "bg-ink/[0.055] text-ink-soft hover:bg-ink/[0.09]"
              }`}
            >
              <input
                type="radio"
                name={name}
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
    </fieldset>
  );
}

const YES_NO = [
  { value: "yes" as const, label: "Yes" },
  { value: "no" as const, label: "No" },
];

type YesNo = "yes" | "no";

const toBool = (value: YesNo | null) => (value === null ? null : value === "yes");

export function RsvpForm() {
  const namesId = useId();
  const notesId = useId();

  const [names, setNames] = useState("");
  const [attending, setAttending] = useState<Attending | null>(null);
  const [ceremony, setCeremony] = useState<YesNo | null>(null);
  const [reception, setReception] = useState<YesNo | null>(null);
  const [dietary, setDietary] = useState<YesNo | null>(null);
  const [dietaryNotes, setDietaryNotes] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const accepting = attending === "accepts";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "sending") return;

    setError(null);

    if (names.trim().length < 2) {
      setError("Please tell us who is replying.");
      return;
    }
    if (attending === null) {
      setError("Please let us know if you can make it.");
      return;
    }
    if (accepting && (ceremony === null || reception === null || dietary === null)) {
      setError("Please answer the remaining questions.");
      return;
    }
    if (accepting && dietary === "yes" && dietaryNotes.trim().length === 0) {
      setError("Please tell us about your dietary restrictions.");
      return;
    }

    const submission: RsvpSubmission = {
      names: names.trim(),
      attending,
      ceremony: accepting ? toBool(ceremony) : null,
      reception: accepting ? toBool(reception) : null,
      dietaryRestrictions: accepting ? toBool(dietary) : null,
      dietaryNotes: accepting && dietary === "yes" ? dietaryNotes.trim() : "",
    };

    setStatus("sending");
    const result = await submitRsvp(submission, ENDPOINT);

    if (result.ok) {
      setStatus("sent");
      return;
    }

    setStatus("idle");
    setError(result.message);
  }

  if (status === "sent") {
    return (
      <div className="bg-cream-paper px-8 py-16 text-center sm:px-12">
        <p className="font-script text-4xl text-ink">Thank you</p>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          {accepting
            ? "We have your reply, and we cannot wait to celebrate with you."
            : "We have your reply. You will be missed."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="bg-cream-paper px-7 py-9 text-left sm:px-10 sm:py-11"
    >
      <p className="text-[0.95rem] leading-snug text-ink">{rsvpCopy.intro}</p>

      <div className="mt-7">
        <Field label="Your name(s)">
          <input
            id={namesId}
            type="text"
            value={names}
            onChange={(event) => setNames(event.target.value)}
            autoComplete="name"
            maxLength={200}
            className="w-full border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-olive focus:ring-1 focus:ring-olive"
          />
        </Field>
      </div>

      <ChoiceGroup
        legend="Will you be attending our wedding?"
        name="attending"
        value={attending}
        onChange={setAttending}
        options={[
          { value: "accepts", label: "Joyfully accepts" },
          { value: "declines", label: "Regretfully declines" },
        ]}
      />

      {/* The comp shows every question at once; they only apply to guests who
          are coming, so they appear once the invitation is accepted. */}
      {accepting && (
        <>
          <ChoiceGroup
            legend="Attending ceremony?"
            name="ceremony"
            value={ceremony}
            onChange={setCeremony}
            options={YES_NO}
          />
          <ChoiceGroup
            legend="Attending reception?"
            name="reception"
            value={reception}
            onChange={setReception}
            options={YES_NO}
          />
          <ChoiceGroup
            legend="Any dietary restrictions?"
            name="dietary"
            value={dietary}
            onChange={setDietary}
            options={YES_NO}
          />

          {dietary === "yes" && (
            <Field label="If yes, please specify here.">
              <input
                id={notesId}
                type="text"
                value={dietaryNotes}
                onChange={(event) => setDietaryNotes(event.target.value)}
                maxLength={1000}
                className="w-full border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-olive focus:ring-1 focus:ring-olive"
              />
            </Field>
          )}
        </>
      )}

      {error && (
        <p role="alert" className="mt-6 text-sm text-[#8a3d2f]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="tracking-label mt-8 w-full rounded-sm bg-olive px-4 py-3 text-[0.65rem] text-cream-light transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "sending" ? "Sending" : "Submit"}
      </button>

      <p className="mt-4 text-center text-[0.7rem] leading-relaxed text-ink-soft/80">
        {rsvpCopy.finePrint}
        <br />
        <a
          href={rsvpCopy.finePrintLinkHref}
          className="underline underline-offset-2"
        >
          {rsvpCopy.finePrintLinkLabel}
        </a>
      </p>
    </form>
  );
}
