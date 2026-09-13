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
      fontSize: {
        "step--2": "var(--step--2)",
        "step--1": "var(--step--1)",
        "step-0": "var(--step-0)",
        "step-1": "var(--step-1)",
        "step-2": "var(--step-2)",
        "step-3": "var(--step-3)",
        "step-3-long": "var(--step-3-long)",
        "step-4": "var(--step-4)",
      },
      maxWidth: {
        prose: "34rem",
        content: "68rem",
      },
      transitionTimingFunction: {
        "out-cubic": "var(--ease-out)",
      },
      minHeight: {
        tap: "var(--tap)",
      },
      minWidth: {
        tap: "var(--tap)",
      },
    },
  },
  plugins: [],
};

export default config;
