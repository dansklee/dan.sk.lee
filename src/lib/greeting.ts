/**
 * Example module — replace this with the real thing once the project has a purpose.
 * It exists so the build, tests, linting, and CLI wiring all have something to
 * exercise on a fresh clone.
 */

export interface GreetOptions {
  /** Shout the greeting in upper case. Defaults to `false`. */
  shout?: boolean;
}

/**
 * Build a greeting for `name`.
 *
 * @throws {TypeError} if `name` is empty or only whitespace.
 */
export function greet(name: string, options: GreetOptions = {}): string {
  const trimmed = name.trim();
  if (trimmed === "") {
    throw new TypeError("name must not be empty");
  }

  const message = `Hello, ${trimmed}!`;
  return options.shout ? message.toUpperCase() : message;
}
