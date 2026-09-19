import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const template = new URL("../.env.example", import.meta.url);
const destination = new URL("../.env.local", import.meta.url);
const source = await readFile(template, "utf8");
const contents = source.replace(/GENERATE_[A-Z_]+/g, () =>
  randomBytes(32).toString("base64url"),
);

try {
  await writeFile(destination, contents, { flag: "wx", mode: 0o600 });
  console.log(
    "Created .env.local with random local secrets. Values were not logged.",
  );
} catch (error) {
  if (error.code !== "EEXIST") throw error;
  console.log(".env.local already exists; kept it unchanged.");
}
