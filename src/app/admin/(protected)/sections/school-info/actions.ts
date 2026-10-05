"use server";

import { revalidatePath } from "next/cache";

import {
  checkSectionRevision,
  zodIssuesToFieldErrors,
} from "@/lib/content/sections/adapter";

import { requireAdmin } from "@/lib/auth/require-admin";
import type { SchoolInfoContent } from "@/lib/content/sections/school-info";
import { schoolInfoContent } from "@/lib/content/sections/content";
import { uploadSectionImage } from "@/lib/content/sections/media";
import type { SectionSaveResult } from "@/lib/content/sections/types";

export async function saveSchoolInfoAction(
  _prevState: SectionSaveResult | null,
  formData: FormData,
): Promise<SectionSaveResult> {
  await requireAdmin();
  const revisionError = await checkSectionRevision(
    "site-school-info",
    Number(formData.get("revision")),
  );
  if (revisionError) return { status: "error", message: revisionError };

  const alt = String(formData.get("logoAlt") ?? "");
  const mediaId = Number(formData.get("logoMediaId") ?? 0);

  const footerPrograms = formData
    .getAll("footerPrograms")
    .map((value) => String(value).trim())
    .filter(Boolean);

  const input: SchoolInfoContent = {
    schoolName: String(formData.get("schoolName") ?? ""),
    shortName: String(formData.get("shortName") ?? ""),
    logo: { mediaId, alt },
    address: String(formData.get("address") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    officeHours: String(formData.get("officeHours") ?? ""),
    footerTagline: String(formData.get("footerTagline") ?? ""),
    footerPrograms,
  };

  const file = formData.get("logoFile");
  const draft = structuredClone(input);
  if (file instanceof File && file.size > 0) draft.logo.mediaId = 1;
  const parsed = schoolInfoContent.schema.safeParse(draft);
  if (!parsed.success)
    return {
      status: "validation_error",
      fieldErrors: zodIssuesToFieldErrors(parsed.error),
    };
  let uploadedMedia: Record<number, number> | undefined;
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadSectionImage(file, alt);
    if ("error" in uploaded) {
      return { status: "error", message: uploaded.error };
    }
    input.logo.mediaId = uploaded.mediaId;
    uploadedMedia = { 0: uploaded.mediaId };
  }

  const result = await schoolInfoContent.save(
    input,
    Number(formData.get("revision")),
  );
  if (result.status !== "success") return result;

  let cacheWarning = false;
  try {
    revalidatePath("/");
    revalidatePath("/news/[slug]", "page");
  } catch {
    cacheWarning = true;
  }
  return { ...result, cacheWarning, uploadedMedia };
}
