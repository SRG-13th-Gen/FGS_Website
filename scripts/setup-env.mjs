import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const templatePath = new URL("../.env.example", import.meta.url);
const destinationPath = new URL("../.env.local", import.meta.url);

function randomSecret() {
  return randomBytes(32).toString("base64url");
}

// Keys this script keeps filled in .env.local without overwriting existing
// values. Real OAuth client credentials and admin emails are supplied separately.
const managedDefaults = {
  NEXTAUTH_SECRET: randomSecret,
};

function parseValues(contents) {
  const values = new Map();
  for (const line of contents.split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line);
    if (match) values.set(match[1], match[2]);
  }
  return values;
}

function setValueInPlace(contents, key, value) {
  const lineRegex = new RegExp(`^${key}=.*$`, "m");
  if (!lineRegex.test(contents)) return null;
  return contents.replace(lineRegex, `${key}=${value}`);
}

let contents;
let isNewFile = false;
try {
  contents = await readFile(destinationPath, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  isNewFile = true;
  const template = await readFile(templatePath, "utf8");
  contents = template.replace(/GENERATE_[A-Z_]+/g, () => randomSecret());
}

const values = parseValues(contents);
const linesToAppend = [];
let filledInPlace = false;
for (const [key, generate] of Object.entries(managedDefaults)) {
  if (values.get(key)) continue; // already has a value; never overwrite it
  const value = generate();
  const updated = setValueInPlace(contents, key, value);
  if (updated !== null) {
    contents = updated;
    filledInPlace = true;
  } else {
    linesToAppend.push(`${key}=${value}`);
  }
}

if (linesToAppend.length > 0) {
  const separator = contents.length > 0 && !contents.endsWith("\n") ? "\n" : "";
  contents += separator + linesToAppend.join("\n") + "\n";
}

await writeFile(destinationPath, contents, { mode: 0o600 });

if (isNewFile) {
  console.log(
    "Created .env.local with random local secrets. Values were not logged.",
  );
} else if (filledInPlace || linesToAppend.length > 0) {
  console.log("Added missing keys to .env.local. Values were not logged.");
} else {
  console.log(".env.local already has all managed keys; left it unchanged.");
}
