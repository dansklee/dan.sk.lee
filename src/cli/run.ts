import { parseArgs } from "node:util";

import { greet } from "../lib/greeting.js";
import { getVersion } from "../lib/version.js";

export const USAGE = `Usage: app [options] <name>

Options:
  -s, --shout      Upper-case the greeting
  -v, --version    Print the version and exit
  -h, --help       Show this help and exit
`;

export interface Streams {
  stdout: (chunk: string) => void;
  stderr: (chunk: string) => void;
}

const defaultStreams: Streams = {
  stdout: (chunk) => void process.stdout.write(chunk),
  stderr: (chunk) => void process.stderr.write(chunk),
};

function parse(args: string[]) {
  return parseArgs({
    args,
    options: {
      shout: { type: "boolean", short: "s", default: false },
      version: { type: "boolean", short: "v", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });
}

/**
 * Run the CLI and return the process exit code.
 *
 * Output is written through `streams` so tests can capture it without
 * touching the real stdio.
 */
export function run(argv: string[], streams: Streams = defaultStreams): number {
  let parsed: ReturnType<typeof parse>;
  try {
    parsed = parse(argv);
  } catch (error) {
    streams.stderr(`error: ${(error as Error).message}\n\n${USAGE}`);
    return 2;
  }

  const { values, positionals } = parsed;

  if (values.help) {
    streams.stdout(USAGE);
    return 0;
  }

  if (values.version) {
    streams.stdout(`${getVersion()}\n`);
    return 0;
  }

  const name = positionals[0];
  if (name === undefined) {
    streams.stderr(`error: missing <name>\n\n${USAGE}`);
    return 2;
  }

  try {
    streams.stdout(`${greet(name, { shout: values.shout })}\n`);
  } catch (error) {
    streams.stderr(`error: ${(error as Error).message}\n`);
    return 1;
  }

  return 0;
}
