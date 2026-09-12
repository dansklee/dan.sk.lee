import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next writes its own AGENTS.md and CLAUDE.md on dev start otherwise, which
  // show up as surprise untracked files and would overwrite a real one.
  agentRules: false,
};

export default nextConfig;
