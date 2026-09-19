import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const envFile = fileURLToPath(new URL("../.env.local", import.meta.url));

if (!existsSync(envFile)) {
  console.error("Missing .env.local. Run pnpm setup:env first.");
  process.exit(1);
}

const result = spawnSync(
  "docker",
  ["compose", "--env-file", envFile, ...process.argv.slice(2)],
  { cwd: root, stdio: "inherit", shell: false },
);

if (result.error) {
  console.error(
    "Docker could not start. Install/start Docker Desktop and retry.",
  );
}
process.exit(result.status ?? 1);
