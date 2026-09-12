/**
 * Every word and image slot on the site. Edit copy here, not in components.
 *
 * Anything marked TODO came through as placeholder or unreadable text in the
 * designer's comps and needs a real value before the site goes out.
 */

export const wedding = {
  couple: "Dan & Tien",
  location: "Santa Barbara, California",
  dateLabel: "May 8, 2027",
  /** Ceremony start, Pacific Daylight Time. Drives the countdown. */
  dateISO: "2027-05-08T12:30:00-07:00",
  rsvpDeadline: "March 1st, 2027",
} as const;

export const story = {
  title: "Our Story",
  paragraphs: [
    "What started with one date became an unexpected adventure.",
    "We met in 2015 at a tiny coffee shop in Berkeley, where a spilled latte turned into a conversation. What began as a simple conversation quickly turned into something neither of us saw coming. Since then, we have built a life full of travel, late-night takeout, and a shared habit of laughing at the wrong moments.",
    "We're so excited to celebrate this special moment with the people we love most. Thank you for being a part of our journey. We can't wait to celebrate with you.",
  ],
  signOff: "With love,",
} as const;

export const venues = [
  {
    name: "Ceremony",
    venue: "Sunken Gardens at the Santa Barbara Courthouse",
    address: ["1100 Anacapa Street", "Santa Barbara, California"],
    note: "An open-air ceremony. Parking is available nearby.",
  },
  {
    name: "Reception",
    venue: "Marisella at The Ritz-Carlton Bacara, Santa Barbara",
    address: ["8301 Hollister Avenue", "Santa Barbara, California"],
    note: null,
  },
] as const;

/** `icon` keys map to the line drawings in components/Icons.tsx. */
export const schedule = [
  { time: "12:30 PM", label: "Ceremony", icon: "rings" },
  { time: "1:00 PM", label: "Photos", icon: "camera" },
  { time: "2:00 PM", label: "Reset", icon: "fountain" },
  { time: "5:00 PM", label: "Reception", icon: "glasses" },
  { time: "7:00 PM", label: "Dinner", icon: "table" },
  { time: "10:00 PM", label: "Farewell", icon: "car" },
] as const;

export const details = [
  {
    title: "Accommodations",
    paragraphs: [
      "Santa Barbara offers a variety of wonderful accommodations. For easy access to our events, we recommend staying in Downtown Santa Barbara.",
    ],
  },
  {
    title: "Dress Code",
    paragraphs: ["We kindly ask guests to wear cocktail attire."],
  },
  {
    title: "Transportation",
    paragraphs: [
      "We recommend flying into Santa Barbara Airport (SBA), just a short drive from downtown Santa Barbara and The Ritz-Carlton Bacara.",
      "We recommend using rideshare services such as Uber/Lyft and typically takes 15-25 minutes. If you plan to drive, please allow a little extra time for valet upon arrival.",
    ],
  },
] as const;

export const gifts = {
  eyebrow: "A Note",
  title: "On Gifts",
  body: "Your presence is the greatest gift. For those who have kindly asked, a contribution toward Simon's dream backyard would be deeply appreciated.",
  ctaLabel: "Click Here",
  /** TODO: registry or fund link. */
  ctaHref: "#",
  closing: "Thank You",
} as const;

export const recommendations = [
  {
    name: "State Street Promenade",
    address: "500 State St, Santa Barbara, CA 93101",
    blurb:
      "Wander this historic street, lined with independent shops, cafés, and cosy corners.",
    image: "/images/rec-state-street.svg",
  },
  {
    name: "McConnell's Fine Ice Creams",
    address: "728 State St, Santa Barbara, CA 93101",
    blurb:
      "A local favorite, enjoy a scoop on us after the ceremony, just a short stroll away.",
    image: "/images/rec-mcconnells.svg",
  },
  {
    name: "The Funk Zone",
    address: null,
    blurb:
      "A lively little pocket of wine, local shops, good food, and great coffee.",
    image: "/images/rec-funk-zone.svg",
  },
  {
    // TODO: the comp left this card as template filler (it describes a National
    // Trust property in England). Replace name, address and blurb.
    name: "Restaurant Here",
    address: null,
    blurb: "Los Agaves · East Beach Tacos",
    image: "/images/rec-placeholder.svg",
  },
] as const;

export const gallery = [
  { src: "/images/gallery-1.svg", alt: "Dan and Tien walking with their dog" },
  { src: "/images/gallery-2.svg", alt: "Dan and Tien dancing on a staircase" },
  { src: "/images/gallery-3.svg", alt: "Dan and Tien beside a fountain" },
] as const;

export const rsvpCopy = {
  title: "RSVP",
  deadline: `Kindly reply by ${wedding.rsvpDeadline}.`,
  intro: "Please RSVP for the guest(s) named on your invitation.",
  /** TODO: the fine print under the button was unreadable in the comp. */
  finePrint: "Replying for more than one guest? Please list every name above.",
  finePrintLinkLabel: "Need to change your reply?",
  finePrintLinkHref: "#",
} as const;

export const closing = {
  lines: [
    "We can't wait to celebrate with you.",
    "If you have any questions, please get in contact with us.",
  ],
} as const;
