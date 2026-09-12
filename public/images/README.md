# Image slots

Two different sources here.

`gallery-*.jpg` are the couple's photographs, in colour, as the comps have
them. `bg-*.jpg` are the **calla lilies** from the comps themselves — the
blurred macro the designer put behind every photographic band — lifted from
the Canva exports and converted to black and white.

Replace one by dropping in a file of the same name, and update the extension
in `data/wedding.ts` if it changes.

| File | Where it appears | Suggested size |
|---|---|---|
| `bg-hero.jpg` | Full-bleed behind the couple's names | calla lilies, black and white |
| `bg-venues.jpg` | Behind Ceremony / Reception | calla lilies, black and white |
| `bg-rsvp.jpg` | Behind the RSVP form | calla lilies, black and white |
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
| Backdrop source | the comps' own calla lily bands | `bg-*.jpg`, greyscale |
| Backdrop scrim | 25% warm black | `.photo-scrim` in `app/globals.css` |

The gallery frames are wider than the photographs, so each one sets its own
`position` in `data/wedding.ts`. The comp crops the top of every frame and
never the bottom — feet and the dog stay in shot — which is why those values
sit below 50%.

### Where the backdrops come from

Each one is cropped from its own page in the comps, never from another:

| File | Comp | Region |
|---|---|---|
| `bg-hero.jpg` | page 1 (`10c27aa3`) | x 0-320, y 0-540 |
| `bg-venues.jpg` | page 1 | x 0-340, y 1150-1689 |
| `bg-rsvp.jpg` | page 3 (`0ceb2b03`) | x 40-340, y 0-600 |

The regions were chosen by scanning each band for the text-free window whose
own mean luminance came closest to the band's, so the backdrop keeps the
exposure the designer chose rather than whichever corner happened to be handy.
Greyscale preserves that luminance almost exactly — 61→62, 67→68, 54→54.

The scrim is only 25%: these pixels already arrive at their finished tone, so
it has to protect type over the bright blooms, not darken a daylight
photograph. At 25% the worst case on any section is 4.73:1 against cream,
clearing AA, measured with the type hidden.
