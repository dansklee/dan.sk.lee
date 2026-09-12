# Image slots

All of these are the real photography, resized and re-encoded from the
originals (1.2MB each down to 130-230KB). The same three frames do double
duty: once in the gallery, and once as the backdrop behind a photographic
section. Replace one by dropping in a file of the same name, and update the
extension in `data/wedding.ts` if it changes.

| File | Where it appears | Suggested size |
|---|---|---|
| `bg-hero.jpg` | Full-bleed behind the couple's names | portrait, full frame |
| `bg-venues.jpg` | Behind Ceremony / Reception | portrait, full frame |
| `bg-rsvp.jpg` | Behind the RSVP form | portrait, full frame |
| `gallery-1..3.jpg` | Swipeable gallery under The Day | 2:3 portrait — real photographs |
| `rec-*.svg` | Local recommendation cards | 960 × 1140, portrait |

The `bg-*` files are kept as full frames rather than cropped to landscape: a
wide screen shows only a horizontal band of them, and *which* band is chosen
belongs in CSS, where it differs per section. Each section sets its own
`backgroundPosition` — cropping that choice into the file instead sliced the
couple off at the shoulders.

They sit under a dark scrim (`.photo-scrim` in `app/globals.css`) at 70%.
That number is not arbitrary: these frames are high-key, all white
architecture and sky, and at 65% the small copy over them measured 4.32:1
against cream, under the 4.5:1 needed. At 70% every heading and paragraph on
a photographic section clears AA, measured at both phone and desktop widths.
