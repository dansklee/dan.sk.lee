# Google Sheets backend

The RSVP backend is a Google Apps Script Web App in front of one spreadsheet.
No server, no database, no hosting cost.

Source: [`apps-script/Code.gs`](../../apps-script/Code.gs)

## Sheet layout

The `Responses` tab is created automatically on first submission.

| timestamp | names | attending | ceremony | reception | dietaryRestrictions | dietaryNotes | userAgent |
|---|---|---|---|---|---|---|---|
| 2026-09-12 10:04 | Alex & Sam Lee | accepts | TRUE | TRUE | FALSE | | Mozilla/5.0… |
| 2026-09-12 11:31 | Jo Park | declines | | | | | Mozilla/5.0… |

`names` is free text, exactly as the guest typed it — the form asks for "the
guest(s) named on your invitation", so one row can cover a household.

The four columns after `attending` are blank for anyone who declines: the form
does not ask those questions once someone says they cannot come.

**Every submission appends a row.** With free-text names there is no reliable
key to update against, and two guests sharing a name would silently overwrite
each other. Duplicates are easy to reconcile; a lost reply is not. If someone
replies twice, the newest row wins — sort by `timestamp` when you count.

## Deploying

1. Create the spreadsheet. Copy its id from the URL
   (`docs.google.com/spreadsheets/d/<ID>/edit`).
2. **Extensions → Apps Script**, paste in `apps-script/Code.gs`.
3. **Project Settings → Script properties** → add `SPREADSHEET_ID` = the id.
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the `/exec` URL into `.env.local` as `NEXT_PUBLIC_RSVP_ENDPOINT`, and
   into the same variable in your Vercel project settings.

Re-deploy as a **new version** after editing the script, or the live URL keeps
serving the old code.

## API

```
POST { action: "rsvp", names, attending, ceremony, reception,
       dietaryRestrictions, dietaryNotes }
  -> { ok: true, data: { attending } }
```

`attending` is `"accepts"` or `"declines"`. The three yes/no answers are
booleans when accepting and `null` when declining.

Failures answer `{ ok: false, error, message }`, where `message` is safe to
show a guest. Codes are listed in `RsvpErrorCode` in
[`lib/rsvp/types.ts`](../../lib/rsvp/types.ts).

There is no `GET`: replies are private to the couple's spreadsheet, so the
endpoint never reads anything back out.

The client is [`lib/rsvp/client.ts`](../../lib/rsvp/client.ts). It posts
`Content-Type: text/plain` on purpose — that keeps the request a CORS "simple
request", and Apps Script does not answer the preflight that
`application/json` would trigger.

## Tests

```
npm run test:backend
```

Stubs the Google runtime and drives the real `Code.gs`: validation for every
field, the decline path, formula injection, markup stripping, length caps and
the double-tap guard. No dependencies beyond node.

## What this is not

- **Anyone can submit.** The endpoint is public and unauthenticated, which is
  what an open RSVP form means. Expect the occasional junk row; the rate limit
  only stops accidental double-taps, not someone determined.
- **Apps Script quotas** are generous for a wedding but it is not a fast API —
  a few hundred ms per call, which is why the button shows a sending state.
- **Guest text is escaped before it reaches the sheet.** Leading `=`, `+`, `-`
  and `@` are prefixed with `'` so a guest cannot land a live formula in your
  planning spreadsheet, and HTML tags are stripped.
