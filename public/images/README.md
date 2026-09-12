# Image slots

All of these are the real photography, resized and re-encoded from the
originals (1.2MB each down to 130-230KB). The same three frames do double
duty: once in the gallery, and once as the backdrop behind a photographic
section. Replace one by dropping in a file of the same name, and update the
extension in `data/wedding.ts` if it changes.

| File | Where it appears | Suggested size |
|---|---|---|
| `bg-hero.jpg` | Full-bleed behind the couple's names | portrait, full frame, **black and white** |
| `bg-venues.jpg` | Behind Ceremony / Reception | portrait, full frame, **black and white** |
| `bg-rsvp.jpg` | Behind the RSVP form | portrait, full frame, **black and white** |
| `gallery-1..3.jpg` | Swipeable gallery under The Day | 2:3 portrait, in colour as the comp has them |
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

## Matching the comps

Measured off the Canva exports rather than eyeballed, so these are worth
keeping if the layout is ever reworked:

| Thing | Comp | Where it lives |
|---|---|---|
| Gallery frame | 215 × 279px (ratio 0.771) | `aspect-[215/279]` in `Gallery.tsx` |
| Gap between frames | 93px — 43.3% of a frame | `gap-[11.2%]` (11.2% of the row) |
| Gallery row width | 829 of 1087px — 76% of the page | `max-w-[52rem]` |
| Recommendation card gap | 51px on a 276px card — 18.4% | `gap-[8.4%]` |
| Backdrop tone | 16–36% saturation, 58–88/255 luminance | greyscale files + a 70% warm scrim |

The gallery frames are wider than the photographs, so each one sets its own
`position` in `data/wedding.ts`. The comp crops the top of every frame and
never the bottom — feet and the dog stay in shot — which is why those values
sit below 50%.
