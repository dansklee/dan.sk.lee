# Wedding site — reuse inventory & build plan

Status: research complete, awaiting design PNG. Stack decision deferred to the
planning session.

Goal: turn a Canva design (PNG) into a real wedding site with an RSVP flow,
reusing as much existing open source as possible.

## What's already in this repo

Nothing reusable. The repo contains a single unrelated file
(`nyc_doe_data_specialists.py`) — no package.json, no web toolchain. This is a
greenfield build.

## Reference repos evaluated

Cloned and read (not just READMEs). Licensing is the deciding factor: it
determines what we can copy versus only learn from.

| Repo | Stars | License | Stack | Verdict |
|---|---|---|---|---|
| [Matthew14/Wedding](https://github.com/Matthew14/Wedding) | small | **MIT** | Next.js, Mantine, DynamoDB/Cognito/S3 | **Copy the domain logic.** Best RSVP model found. AWS layer not reusable. |
| [dewanakl/undangan](https://github.com/dewanakl/undangan) | ~795 | **MIT** | Vanilla JS, Bootstrap, esbuild | Copyable but stack mismatch. Good reference for guestbook + admin dashboard. |
| [andikaputradev/wedding-invitation](https://github.com/andikaputradev/wedding-invitation) | ~14 | **none — all rights reserved** | Next.js 15, React 19, Tailwind, framer-motion, zod, Apps Script | **Do not copy.** Architecture is exactly what we want; treat as inspiration only and write our own. |
| [rampatra/wedding-website](https://github.com/rampatra/wedding-website) | ~1.8k | **GPL-3.0** | SASS/jQuery static, Google Sheets RSVP | Avoid copying — GPL would infect this repo. Sheets-as-backend idea is fine to reuse independently. |
| [fderuiter/wedding_website](https://github.com/fderuiter/wedding_website) | small | **AGPL-3.0** | Next.js, Prisma, three.js | Avoid. Strongest copyleft of the set. |

Note: the highest-star wedding repos are the ones we can least use. Stars
tracked design polish, not license compatibility or stack fit.

## What we actually take

1. **RSVP domain model — from Matthew14/Wedding (MIT).**
   The non-obvious, hard-won part, adapted into `lib/rsvp/`:
   - Party-based invitations, not per-person. One 6-char code unlocks a
     household; each named invitee gets an individual attending toggle.
   - Invite URLs as `/<name>-<name>-<CODE>` so the link is personal and
     shareable, with the code always the trailing 6 alphanumerics.
   - Conditional fields: guest selection and accommodation only render when
     the party accepts; declining collapses the form.
   - Cross-field rule: accepting requires at least one guest selected.
   - Fields worth having day one: dietary restrictions, song request, travel
     plans, free-text message.

2. **UI components — shadcn/ui (MIT).**
   Copy-in, not a dependency, so the Canva aesthetic can be restyled freely.
   Avoids rebuilding form/dialog/toast primitives.

3. **Form + validation — react-hook-form + zod.**
   One schema shared by client and server. Standard, no wheel to reinvent.

4. **PNG → layout.** Optional. [abi/screenshot-to-code](https://github.com/abi/screenshot-to-code)
   (MIT, ~78k stars) or [ScreenCoder](https://github.com/leigest519/ScreenCoder)
   (Apache-2.0) produce flat HTML/Tailwind only — useful as a first-pass
   spacing/type reference, never as shipped code. Recommendation is to skip it
   and build components directly from the PNG.

## Proposed stack (to confirm with the design in hand)

Next.js (App Router) + TypeScript + Tailwind + shadcn/ui, deployed on Vercel.

Storage is the one genuinely open decision:

- **Google Sheets via Apps Script** — zero cost, zero infra, and the sheet
  doubles as the guest-list UI for non-technical editing. Ceiling: no guest
  lookup by name, weak validation, awkward for per-party invite codes.
- **Postgres (Supabase/Neon)** — needed for the party/code model above,
  admin dashboard, and editing a submitted RSVP. More setup.

The party-based model in `lib/rsvp/` assumes a real database. If we drop invite
codes in favour of open RSVP, Sheets becomes viable.

## Open questions for the planning session

1. Invite-code flow (personal links per household) or open RSVP anyone can fill?
2. Do guests need to edit an RSVP after submitting?
3. Guest count — does it justify a database and admin view?
4. Beyond RSVP: gallery, registry, travel/hotel info, schedule, guestbook?
5. Domain and hosting — is this going under dan.sk.lee or its own domain?

## Attribution

`lib/rsvp/` is adapted from [Matthew14/Wedding](https://github.com/Matthew14/Wedding),
MIT licensed. See file headers.
