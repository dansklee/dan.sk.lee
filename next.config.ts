import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next writes its own AGENTS.md and CLAUDE.md on dev start otherwise, which
  // show up as surprise untracked files and would overwrite a real one.
  agentRules: false,
  images: {
    // Next 16 allowlists qualities and silently falls back to 75 for anything
    // not listed, so a `quality` prop alone has no effect.
    qualities: [75, 85],
  },
};

export default nextConfig;
