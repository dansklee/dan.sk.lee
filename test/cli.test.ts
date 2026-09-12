import { describe, expect, it } from "vitest";

import { run, USAGE } from "../src/cli/run.js";
import { getVersion } from "../src/lib/version.js";

function capture(argv: string[]): { code: number; out: string; err: string } {
  let out = "";
  let err = "";
  const code = run(argv, {
    stdout: (chunk) => {
      out += chunk;
    },
    stderr: (chunk) => {
      err += chunk;
    },
  });
  return { code, out, err };
}

describe("cli", () => {
  it("prints a greeting for a positional name", () => {
    const { code, out } = capture(["Dan"]);
    expect(code).toBe(0);
    expect(out).toBe("Hello, Dan!\n");
  });

  it("honours --shout", () => {
    expect(capture(["--shout", "Dan"]).out).toBe("HELLO, DAN!\n");
    expect(capture(["-s", "Dan"]).out).toBe("HELLO, DAN!\n");
  });

  it("prints usage for --help", () => {
    const { code, out } = capture(["--help"]);
    expect(code).toBe(0);
    expect(out).toBe(USAGE);
  });

  it("prints the package version for --version", () => {
    const { code, out } = capture(["--version"]);
    expect(code).toBe(0);
    expect(out.trim()).toBe(getVersion());
  });

  it("exits 2 when the name is missing", () => {
    const { code, err } = capture([]);
    expect(code).toBe(2);
    expect(err).toContain("missing <name>");
  });

  it("exits 2 on an unknown flag", () => {
    const { code, err } = capture(["--nope", "Dan"]);
    expect(code).toBe(2);
    expect(err).toContain("error:");
  });
});
