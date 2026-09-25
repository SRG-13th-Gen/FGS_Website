// Idempotent content seed for SPEC-007. Run with `pnpm wp:seed-content`.
//
// - Creates one WordPress page per section (by slug) if it doesn't exist yet.
// - Only writes the section's default JSON into fgs_section_data when that
//   field is currently empty — never overwrites content already edited in
//   WordPress (whether by a prior seed run or by an admin via /admin).
// - Uploads bundled default images once, reusing existing media by slug on
//   re-runs instead of re-uploading.
//
// Intentionally imports only registry.ts and its section schema modules
// (pure data + zod, no `server-only` guard, no `@/` aliases) so this script
// can run standalone via tsx without the Next.js app context.
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { SECTION_REGISTRY } from "../src/lib/wordpress/sections/registry";
import {
  HERO_DEFAULTS,
  type HeroContent,
} from "../src/lib/wordpress/sections/hero";
import {
  SCHOOL_INFO_DEFAULTS,
  type SchoolInfoContent,
} from "../src/lib/wordpress/sections/school-info";
import {
  ABOUT_DEFAULTS,
  type AboutContent,
} from "../src/lib/wordpress/sections/about";
import {
  ADMISSION_DEFAULTS,
  type AdmissionContent,
} from "../src/lib/wordpress/sections/admission";
import { SECTION_META_KEY } from "../src/lib/wordpress/sections/meta-key";
import { shouldSeedSectionContent } from "../src/lib/wordpress/sections/seed-logic";

function readEnvLocal(key: string): string {
  const envPath = fileURLToPath(new URL("../.env.local", import.meta.url));
  const content = readFileSync(envPath, "utf8");
  const line = content.split(/\r?\n/).find((l) => l.startsWith(`${key}=`));
  return line ? line.slice(key.length + 1) : "";
}

const BASE_URL = (
  readEnvLocal("WORDPRESS_URL") || "http://localhost:8080"
).replace(/\/+$/, "");
const USERNAME = readEnvLocal("WORDPRESS_USERNAME");
const PASSWORD = readEnvLocal("WORDPRESS_APPLICATION_PASSWORD");

if (!USERNAME || !PASSWORD) {
  console.error(
    "WORDPRESS_USERNAME / WORDPRESS_APPLICATION_PASSWORD are not set in .env.local. " +
      "Create a dedicated WordPress integration account first (see docs/DOCKER.md).",
  );
  process.exit(1);
}

const AUTH_HEADER =
  "Basic " + Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");

function api(path: string): string {
  return `${BASE_URL}/wp-json/wp/v2${path}`;
}

async function findPageBySlug(
  slug: string,
): Promise<{ id: number; meta: Record<string, string> } | null> {
  const res = await fetch(
    api(`/pages?slug=${encodeURIComponent(slug)}&status=publish&per_page=1`),
    {
      headers: { Authorization: AUTH_HEADER },
    },
  );
  if (!res.ok) throw new Error(`GET pages?slug=${slug} failed: ${res.status}`);
  const pages = (await res.json()) as Array<{
    id: number;
    meta?: Record<string, string>;
  }>;
  const page = pages[0];
  return page ? { id: page.id, meta: page.meta ?? {} } : null;
}

async function createPage(slug: string, title: string): Promise<number> {
  const res = await fetch(api("/pages"), {
    method: "POST",
    headers: { Authorization: AUTH_HEADER, "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      slug,
      status: "publish",
      content:
        "<!-- wp:paragraph --><p>This page is managed by the FGS admin CMS. " +
        "Its structured content lives in a custom field, not in this block editor area. " +
        "Edit it at /admin instead.</p><!-- /wp:paragraph -->",
    }),
  });
  if (!res.ok) {
    throw new Error(
      `POST /pages (${slug}) failed: ${res.status} ${await res.text()}`,
    );
  }
  const created = (await res.json()) as { id: number };
  return created.id;
}

async function setPageMeta(pageId: number, value: unknown): Promise<void> {
  const res = await fetch(api(`/pages/${pageId}`), {
    method: "POST",
    headers: { Authorization: AUTH_HEADER, "Content-Type": "application/json" },
    body: JSON.stringify({
      meta: { [SECTION_META_KEY]: JSON.stringify(value) },
    }),
  });
  if (!res.ok) {
    throw new Error(
      `Setting meta on page ${pageId} failed: ${res.status} ${await res.text()}`,
    );
  }
}

function slugify(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mimeTypeFor(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "avif":
      return "image/avif";
    default:
      throw new Error(`Unsupported seed image extension: ${filename}`);
  }
}

/** Reuses existing media by slug on re-runs instead of re-uploading. */
async function uploadOrReuseImage(
  localPath: string,
  altText: string,
): Promise<number> {
  const filename = localPath.split("/").pop()!;
  const slug = slugify(filename);

  const existingRes = await fetch(
    api(`/media?slug=${encodeURIComponent(slug)}`),
    {
      headers: { Authorization: AUTH_HEADER },
    },
  );
  if (existingRes.ok) {
    const existing = (await existingRes.json()) as Array<{ id: number }>;
    if (existing[0]) {
      console.log(
        `  media "${filename}" already uploaded (id ${existing[0].id}), reusing`,
      );
      return existing[0].id;
    }
  }

  const absolutePath = fileURLToPath(
    new URL(`../public${localPath}`, import.meta.url),
  );
  const bytes = await readFile(absolutePath);
  const formData = new FormData();
  formData.set(
    "file",
    new Blob([bytes], { type: mimeTypeFor(filename) }),
    filename,
  );
  formData.set("alt_text", altText);

  const uploadRes = await fetch(api("/media"), {
    method: "POST",
    headers: { Authorization: AUTH_HEADER },
    body: formData,
  });
  if (!uploadRes.ok) {
    throw new Error(
      `Uploading ${filename} failed: ${uploadRes.status} ${await uploadRes.text()}`,
    );
  }
  const uploaded = (await uploadRes.json()) as { id: number };
  console.log(`  uploaded "${filename}" (id ${uploaded.id})`);
  return uploaded.id;
}

async function resolveDefaultsWithImages(slug: string): Promise<unknown> {
  if (slug === "site-hero") {
    const mediaId = await uploadOrReuseImage(
      "/images/hero/fgs-website-e1760252687123.png",
      HERO_DEFAULTS.backgroundImage.alt,
    );
    const data: HeroContent = {
      ...HERO_DEFAULTS,
      backgroundImage: { ...HERO_DEFAULTS.backgroundImage, mediaId },
    };
    return data;
  }
  if (slug === "site-school-info") {
    const mediaId = await uploadOrReuseImage(
      "/images/logo/fgs-logo-website-1.webp",
      SCHOOL_INFO_DEFAULTS.logo.alt,
    );
    const data: SchoolInfoContent = {
      ...SCHOOL_INFO_DEFAULTS,
      logo: { ...SCHOOL_INFO_DEFAULTS.logo, mediaId },
    };
    return data;
  }
  if (slug === "site-about") {
    const mediaId = await uploadOrReuseImage(
      "/images/general/classroom.webp",
      ABOUT_DEFAULTS.featureBanner.image.alt,
    );
    const data: AboutContent = {
      ...ABOUT_DEFAULTS,
      featureBanner: {
        ...ABOUT_DEFAULTS.featureBanner,
        image: { ...ABOUT_DEFAULTS.featureBanner.image, mediaId },
      },
    };
    return data;
  }
  if (slug === "site-admission") {
    const mediaId = await uploadOrReuseImage(
      "/images/general/Admission.webp",
      ADMISSION_DEFAULTS.backgroundImage.alt,
    );
    const data: AdmissionContent = {
      ...ADMISSION_DEFAULTS,
      backgroundImage: { ...ADMISSION_DEFAULTS.backgroundImage, mediaId },
    };
    return data;
  }
  const entry = SECTION_REGISTRY.find((s) => s.slug === slug)!;
  return entry.defaults;
}

async function seedSection(
  entry: (typeof SECTION_REGISTRY)[number],
): Promise<void> {
  console.log(`\n${entry.label} (${entry.slug})`);

  let page = await findPageBySlug(entry.slug);
  if (!page) {
    const id = await createPage(entry.slug, entry.pageTitle);
    console.log(`  created page (id ${id})`);
    page = { id, meta: {} };
  } else {
    console.log(`  page already exists (id ${page.id})`);
  }

  if (!shouldSeedSectionContent(page.meta[SECTION_META_KEY])) {
    console.log("  content already seeded/edited, leaving unchanged");
    return;
  }

  const defaults = await resolveDefaultsWithImages(entry.slug);
  const parsed = entry.schema.safeParse(defaults);
  if (!parsed.success) {
    throw new Error(
      `Default content for ${entry.slug} failed its own schema: ${parsed.error.message}`,
    );
  }

  await setPageMeta(page.id, parsed.data);
  console.log("  wrote default content");
}

async function main() {
  console.log(`Seeding site content into ${BASE_URL} ...`);
  for (const entry of SECTION_REGISTRY) {
    await seedSection(entry);
  }
  console.log("\nDone.");
}

main().catch((error) => {
  console.error(
    "\nSeed failed:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
