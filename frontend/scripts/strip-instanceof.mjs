// Removes the unused `instanceOf*` type guards from the generated API client.
//
// openapi-generator 7.23.0 emits guards that index a value it has just narrowed
// with `'camelCase' in value || 'snake_case' in value`, so each branch is missing
// one of the two keys and `tsc --strict` fails with TS7053. Nothing in the client
// or the app ever calls these guards, so they are dropped rather than patched.
// `npm run generate` runs this straight after generating.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const MODELS_DIR = join(dirname(fileURLToPath(import.meta.url)), "../src/generated/models");

// The JSDoc block through the closing brace. Bodies only ever indent their braces,
// so the first `}` at column 0 is the end of the function.
const GUARD =
  /\/\*\*\r?\n \* Check if a given object implements the \w+ interface\.\r?\n \*\/\r?\nexport function instanceOf\w+\([\s\S]*?\r?\n\}\r?\n\r?\n/g;

let files = 0;
let guards = 0;

for (const name of readdirSync(MODELS_DIR)) {
  if (!name.endsWith(".ts")) continue;
  const path = join(MODELS_DIR, name);
  const before = readFileSync(path, "utf8");
  const after = before.replace(GUARD, () => {
    guards += 1;
    return "";
  });
  if (after !== before) {
    writeFileSync(path, after);
    files += 1;
  }
}

console.log(`strip-instanceof: removed ${guards} unused type guard(s) from ${files} file(s)`);
