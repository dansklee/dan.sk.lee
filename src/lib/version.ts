import { createRequire } from "node:module";

interface PackageManifest {
  version?: string;
}

/**
 * Read the package version from package.json.
 *
 * The relative path resolves to the project root both when running the compiled
 * output (`dist/lib/version.js`) and when running the sources through tsx
 * (`src/lib/version.ts`).
 */
export function getVersion(): string {
  const require = createRequire(import.meta.url);
  const manifest = require("../../package.json") as PackageManifest;
  return manifest.version ?? "0.0.0";
}
