import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";
export async function loadEnvironment() {
  const file = process.env.FGS_ENV_FILE ?? ".env.local";
  try {
    const values = parseEnv(await readFile(file, "utf8"));
    for (const [key, value] of Object.entries(values))
      if (process.env[key] === undefined) process.env[key] = value;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
