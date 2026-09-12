# Dan & Tien

Wedding site for May 8, 2027 in Santa Barbara, California.

Next.js (App Router) + TypeScript + Tailwind, with RSVP replies landing in a
Google Sheet via Apps Script. No database and no server to run.

Built mobile first: a fluid type scale, swipeable galleries, 48px touch targets
and a form that behaves itself on a phone. See
[docs/wedding-site/prototype-notes.md](docs/wedding-site/prototype-notes.md)
for what came across from the earlier prototype and why.

## Getting started

```bash
npm install
cp .env.example .env.local   # add the Apps Script URL, see below
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Validation rules plus the backend |
| `npm run test:validate` | RSVP rules, no DOM needed |
| `npm run test:backend` | Exercises `apps-script/Code.gs` against a stubbed Google runtime |

## Where things live

| Path | What it is |
|---|---|
| `data/wedding.ts` | **All copy and content.** Edit here, not in components. |
| `app/page.tsx` | Page order and the dot navigator |
| `components/sections/` | One file per block in the designer's comps |
| `components/RsvpForm.tsx` | The RSVP form and its client-side validation |
| `components/ui/Filmstrip.tsx` | Swipeable carousel used by the gallery and recommendations |
| `components/ui/Reveal.tsx` | Scroll-reveal observer |
| `lib/rsvp/validate.ts` | Form rules, free of the DOM |
| `lib/rsvp/` | Shared types and the typed fetch client |
| `apps-script/Code.gs` | The Google Sheets backend |
| `public/images/` | Placeholder art — see the README there to swap in real photos |
| `docs/wedding-site/` | Backend setup, reuse inventory, and what came from the prototype |

## RSVP

The form posts to a Google Apps Script Web App that appends a row per reply.
Set it up with [docs/wedding-site/sheets-backend.md](docs/wedding-site/sheets-backend.md),
then put the `/exec` URL in `NEXT_PUBLIC_RSVP_ENDPOINT`.

Until that variable is set the form renders and validates normally but tells
guests it is not connected yet, so nothing breaks in development.

## Still to do

- Replace the placeholders in `public/images/` with the real photography.
- Fill the `TODO` items in `data/wedding.ts`: the gift link, the fourth local
  recommendation, and the fine print under the RSVP button.
