/**
 * Timeline illustrations, lifted from the comps.
 *
 * These are the designer's own line drawings, not redrawn: the olive field was
 * turned to transparency so the stroke keeps its softness and sits on whatever
 * the section's background is.
 *
 * `width` and `height` are the artwork's size in the comp. Keeping them means
 * the icons hold their sizes relative to each other exactly as drawn — the
 * rings are wide and low, the fountain tall and narrow — instead of being
 * squeezed into one square box.
 */
export const icons = {
  rings: { src: "/images/icons/rings.png", width: 66, height: 37 },
  camera: { src: "/images/icons/camera.png", width: 85, height: 57 },
  fountain: { src: "/images/icons/fountain.png", width: 62, height: 66 },
  glasses: { src: "/images/icons/glasses.png", width: 82, height: 72 },
  table: { src: "/images/icons/table.png", width: 80, height: 67 },
  car: { src: "/images/icons/car.png", width: 73, height: 74 },
} as const;

export type IconName = keyof typeof icons;
