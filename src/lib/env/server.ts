import "server-only";

import { parseServerEnvironment } from "@/lib/env/schema";

// Read lazily when a server integration needs configuration, not at build time.
export function getServerEnvironment() {
  return parseServerEnvironment(process.env);
}
