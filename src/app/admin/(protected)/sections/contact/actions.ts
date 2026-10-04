"use server";

import { revalidatePath } from "next/cache";

import { checkSectionRevision } from "@/lib/content/sections/adapter";

import { requireAdmin } from "@/lib/auth/require-admin";
import type { ContactContent } from "@/lib/content/sections/contact";
import { contactContent } from "@/lib/content/sections/content";
import type { SectionSaveResult } from "@/lib/content/sections/types";

function parseJsonField<T>(formData: FormData, name: string, fallback: T): T {
  const raw = formData.get(name);
  if (typeof raw !== "string" || !raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveContactAction(
  _prevState: SectionSaveResult | null,
  formData: FormData,
): Promise<SectionSaveResult> {
  await requireAdmin();
  const revisionError = await checkSectionRevision(
    "site-contact",
    Number(formData.get("revision")),
  );
  if (revisionError) return { status: "error", message: revisionError };

  const input: ContactContent = {
    sectionLabel: String(formData.get("sectionLabel") ?? ""),
    heading: String(formData.get("heading") ?? ""),
    intro: String(formData.get("intro") ?? ""),
    cards: parseJsonField(formData, "cardsJson", []),
  };

  const result = await contactContent.save(
    input,
    Number(formData.get("revision")),
  );
  if (result.status !== "success") return result;

  let cacheWarning = false;
  try {
    revalidatePath("/");
  } catch {
    cacheWarning = true;
  }
  return { ...result, cacheWarning };
}
