# dan-sk-lee

A TypeScript/Node project scaffold: strict TypeScript, Vitest, ESLint, Prettier,
and GitHub Actions CI wired together and passing on a fresh clone.

The `greet` module and the CLI that calls it are **placeholders** — they exist so
every part of the toolchain has something to compile, test, and lint. Replace
them with the real project.

## Requirements

- Node.js 22+ (see `.nvmrc`)

## Getting started

```bash
npm install
npm run check   # typecheck + lint + format + tests
npm run dev -- Dan
```

## Layout

```
src/
  index.ts        Public API — thin re-exports, no implementation
  lib/            Implementation modules
    greeting.ts   Placeholder example — replace
    version.ts    Reads the version out of package.json
  cli/
    index.ts      bin entrypoint; sets process.exitCode
    run.ts        Argument parsing and command logic (testable, no stdio)
test/             Vitest specs, mirroring src/
```

The CLI's logic lives in `src/cli/run.ts` and writes through an injected
`Streams` object, so tests drive it directly without spawning a process or
patching `process.stdout`.

## Scripts

| Script                            | What it does                                               |
| --------------------------------- | ---------------------------------------------------------- |
| `npm run dev`                     | Run the CLI from source with tsx, watching for changes     |
| `npm run build`                   | Compile `src/` to `dist/` with declarations and sourcemaps |
| `npm start`                       | Run the compiled CLI                                       |
| `npm test`                        | Run the test suite once                                    |
| `npm run test:watch`              | Run tests in watch mode                                    |
| `npm run test:coverage`           | Run tests with v8 coverage                                 |
| `npm run typecheck`               | Type-check without emitting                                |
| `npm run lint` / `lint:fix`       | ESLint (type-aware rules)                                  |
| `npm run format` / `format:check` | Prettier                                                   |
| `npm run check`                   | Everything CI runs                                         |
| `npm run clean`                   | Remove build output                                        |

## CI

`.github/workflows/ci.yml` runs typecheck, lint, format check, tests, and build
on every push and pull request.

## Making it yours

1. Rename the package in `package.json` (`name`, `description`, `bin`).
2. Replace `src/lib/greeting.ts` and its test with real code.
3. Update the public surface in `src/index.ts`.
4. Set the copyright holder in `LICENSE` (currently the GitHub handle).
5. Drop `private: true` from `package.json` if you intend to publish.

## Also in this repo

`nyc_doe_data_specialists.py` is a standalone Python script that predates this
scaffold; it has no connection to the Node project.
