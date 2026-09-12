# Google Sheets backend

The RSVP backend is a Google Apps Script Web App in front of one spreadsheet.
No server, no database, no hosting cost — and the spreadsheet doubles as the
guest-list editor, so it can be maintained without touching code.

Source: [`apps-script/Code.gs`](../../apps-script/Code.gs)

## Sheet layout

Both tabs are created automatically on first use, with these headers.

### `Guests` — maintained by hand

One row per person. **Everyone in a party shares one code**; that is what makes
them a party.

| code | firstName | lastName | isPrimary | allowsPlusOne |
|---|---|---|---|---|
| `AB12CD` | Alex | Lee | TRUE | FALSE |
| `AB12CD` | Sam | Lee | FALSE | FALSE |
| `ZZ99ZZ` | Jo | Park | TRUE | TRUE |

- `code` — 6 characters. Case-insensitive; stored and compared uppercase.
- `isPrimary` — who the invitation is addressed to.
- `allowsPlusOne` — TRUE on any row grants the whole party an unnamed plus-one.

To mint codes: open the Apps Script editor and run `generateInviteCodes(20)`,
then read them from the execution log. Codes skip `0/O` and `1/I/L` so they
survive being read off a printed invitation.

### `Responses` — written by the app

One row per party, **overwritten** when a party amends its RSVP, so the sheet
always shows current answers rather than a submission history.

| updatedAt | code | status | attending | plusOneName | dietaryRestrictions | songRequest | travelPlans | message | userAgent |

## Deploying

1. Create the spreadsheet. Copy its id from the URL
   (`docs.google.com/spreadsheets/d/<ID>/edit`).
2. **Extensions → Apps Script**, paste in `apps-script/Code.gs`.
3. **Project Settings → Script properties** → add `SPREADSHEET_ID` = the id.
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the `/exec` URL — that is the endpoint the site calls.

Re-deploy as a **new version** after editing the script, or the live URL keeps
serving the old code.

## API

```
GET  ?action=invite&code=AB12CD
  -> { ok: true, data: { code, invitees[], allowsPlusOne, existingResponse } }

POST { action: "rsvp", code, status, attending[], plusOneName?, ... }
  -> { ok: true, data: { status, attending[] } }
```

Failures answer `{ ok: false, error, message }`, where `message` is safe to show
a guest. Codes are in `RsvpErrorCode` in [`lib/rsvp/types.ts`](../../lib/rsvp/types.ts).

The client is [`lib/rsvp/client.ts`](../../lib/rsvp/client.ts). It posts
`Content-Type: text/plain` on purpose: that keeps the request a CORS "simple
request", and Apps Script does not answer the preflight that `application/json`
would trigger.

## Tests

```
node apps-script/test/code.test.mjs
```

Stubs the Google runtime and drives the real `Code.gs`, covering lookup,
upsert-on-resubmit, guest-list spoofing, formula injection, and rate limiting.
No dependencies.

## What this is not

Worth knowing before the invitations go out:

- **Invite codes are obscurity, not authentication.** The endpoint is public by
  necessity. 6 characters from a 31-character alphabet is ~887M combinations,
  which is ample against casual guessing but is not a login. Anyone holding a
  code sees that party's names and their response.
- **Keep sensitive detail out of the sheet.** Home addresses and phone numbers
  do not belong in `Guests`; a leaked code would expose them.
- **Apps Script quotas** are generous for a wedding (~20k URL-fetch calls/day on
  a consumer account) but it is not a fast API — expect a few hundred ms per
  call, and design the form to show a pending state.
- **Guest text is escaped before it reaches the sheet.** Leading `=`, `+`, `-`
  and `@` are prefixed with `'` so a guest cannot land a live formula in the
  planning spreadsheet.
