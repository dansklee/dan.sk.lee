# What came from the prototype

The prototype at [dansklee/wedding-rsvp](https://github.com/dansklee/wedding-rsvp)
is a static six-page site built against the **first** Canva design. Its
`DESIGN.md` is unusually good: every value has a rationale and a source. This
site is built against the second design, so the visual tokens do not carry
over — but the interaction work does, and that is what was liked about it.

## Ported

**The RSVP form.** The prototype's form is better than what was here:

- Errors sit **under the field they belong to**, not in one message at the top.
- Nothing is flagged until the first failed submit. After that errors *clear*
  as the guest fixes them, but a newly revealed question never arrives
  pre-flagged for an answer they have not had a chance to give.
- A failed submit **moves focus to the first problem** and scrolls it to centre.
- Collapsed branches are `inert`, not merely hidden. A hidden panel that still
  holds focusable inputs traps keyboard users in invisible fields, and a screen
  reader will happily announce a question that is not on screen.
- Errors belonging to a branch that just closed are dropped, so declining is
  never blocked by a message pointing at collapsed markup.
- The confirmation uses the guest's first name and changes with the answer.
- Rules live in `lib/rsvp/validate.ts`, free of the DOM, so they are tested
  directly rather than through a browser.

**The gallery carousel** (`components/ui/Filmstrip.tsx`), with its three
load-bearing decisions intact:

- Frames butt edge to edge, **gap zero**, so the row reads as one strip of film
  rather than three cards.
- Each frame is **78% of the viewport**, so the next one peeks in and it is
  obvious there is more to swipe.
- A seamless strip has no card edges to count, so a **position indicator**
  carries that information: the thumb's width is the share on screen, its
  offset is how far through you are. The "Swipe for more" hint fades once
  sliding begins.

Above `md` there is room for everything at once and it reverts to a grid, where
the indicator would be meaningless. The local recommendations reuse it with a
gap, since framed cards need room to read as cards.

**The motion system.** Scroll reveal at 30px over 800ms, staggered 70ms between
siblings and restarting per section, on `cubic-bezier(0.33, 1, 0.68, 1)`. The
prototype's notes explain why the more obvious easing failed: it covered 92% of
the distance in the first 29% of the duration, so everything finished before it
reached the middle of the screen and the page read as having no animation.

The hidden state lives behind a `.has-reveal` class the script adds only after
it has an observer and the visitor has not asked for reduced motion, and a
scroll sweep backs up the observer — a fast flick can move an element past the
fold between two frames without ever intersecting. Nothing can end up
permanently invisible.

**Mobile fundamentals.** Fluid `clamp()` type scale instead of breakpoint steps;
48px minimum touch targets; form inputs never below 16px, since iOS Safari zooms
the viewport otherwise and does not zoom back; hover styles only inside
`@media (hover: hover)`; `viewport-fit=cover` with safe-area insets so the
navigator clears the home indicator.

**EB Garamond over Playfair Display.** The prototype's designer established by
comparing letterforms against 1:1 crops that the original display face is a
low-contrast Garamond with fine wedge serifs, not a Didone. Playfair is
visually about a century off. That reasoning holds for the second design too.

## Not ported

- **Sage and beige palette, and monospace body copy.** The second design moved
  to olive and cream with a serif body; monospace survives only in the
  countdown. `DESIGN.md`'s "never swap the monospace for a proportional face"
  was load-bearing for the first design, not this one.
- **Google Forms as the backend.** It sends no CORS headers, so the prototype
  submits with `mode: 'no-cors'` and a resolved promise means "sent", not
  "recorded" — a failure is indistinguishable from success. The Apps Script
  backend here returns a real result.
- **The envelope opening, the postcard, the `v2/` scroll-driven reel.** Version
  B experiments against a design that has since changed.
- **Six separate pages.** The second design is four scrolling pages behind a
  dot navigator.

## Still worth taking

`lib.js` has an `.ics` builder and platform-aware map links (Apple Maps on
iOS, Google elsewhere) that would suit the venue addresses and the schedule.
Neither appears in the second design, so neither was added.
