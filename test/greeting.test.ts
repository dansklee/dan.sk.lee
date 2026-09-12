import { describe, expect, it } from "vitest";

import { greet } from "../src/lib/greeting.js";

describe("greet", () => {
  it("greets by name", () => {
    expect(greet("Dan")).toBe("Hello, Dan!");
  });

  it("trims surrounding whitespace", () => {
    expect(greet("  Dan  ")).toBe("Hello, Dan!");
  });

  it("shouts when asked", () => {
    expect(greet("Dan", { shout: true })).toBe("HELLO, DAN!");
  });

  it("rejects an empty name", () => {
    expect(() => greet("   ")).toThrow(TypeError);
  });
});
