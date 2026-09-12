import type { Config } from "tailwindcss";

/** Palette sampled from the designer's comps. */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        olive: {
          DEFAULT: "#4E5139",
          deep: "#3F4230",
          light: "#6B6E52",
        },
        cream: {
          DEFAULT: "#E9E4D6",
          light: "#F2EEE3",
          paper: "#FAF8F2",
        },
        ink: {
          DEFAULT: "#3A3C2C",
          soft: "#5F6149",
        },
        gilt: "#A9A276",
      },
      fontFamily: {
        body: ["var(--font-body)", "Georgia", "serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        script: ["var(--font-script)", "cursive"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        prose: "34rem",
      },
    },
  },
  plugins: [],
};

export default config;
