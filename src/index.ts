/**
 * Public API of the package.
 *
 * Anything exported here is what consumers get from `import { ... } from "dan-sk-lee"`.
 * Keep this file as a thin re-export surface; put the implementation in `src/lib`.
 */
export { greet, type GreetOptions } from "./lib/greeting.js";
export { getVersion } from "./lib/version.js";
