# Image slots

The three `gallery-*.jpg` files are the real photography, resized to 1600px
tall and re-encoded (about 150KB each, down from 1.2MB). Everything else is
still a generated placeholder, sized and toned to match the designer's comps
so the layout reads correctly. Replace one by dropping in a file of the same
name, and update the extension in `data/wedding.ts` if it changes.

| File | Where it appears | Suggested size |
|---|---|---|
| `bg-hero.svg` | Full-bleed behind the couple's names | 2400 × 1600, landscape |
| `bg-venues.svg` | Behind Ceremony / Reception | 2400 × 1600, landscape |
| `bg-rsvp.svg` | Behind the RSVP form | 2400 × 1600, landscape |
| `gallery-1..3.jpg` | Swipeable gallery under The Day | 2:3 portrait — real photographs |
| `rec-*.svg` | Local recommendation cards | 960 × 1140, portrait |

The three `bg-*` images sit under a dark scrim (`.photo-scrim` in
`app/globals.css`) so light type stays legible whatever the crop. Moody,
low-contrast frames work best; busy highlights fight the text.
