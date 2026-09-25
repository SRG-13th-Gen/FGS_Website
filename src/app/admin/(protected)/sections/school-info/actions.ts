"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import type { SchoolInfoContent } from "@/lib/wordpress/sections/school-info";
import { schoolInfoContent } from "@/lib/wordpress/sections/content";
import { uploadSectionImage } from "@/lib/wordpress/sections/media";
import type { SectionSaveResult } from "@/lib/wordpress/sections/types";

export async function saveSchoolInfoAction(
  _prevState: SectionSaveResult | null,
  formData: FormData,
): Promise<SectionSaveResult> {
  await requireAdmin();

  const alt = String(formData.get("logoAlt") ?? "");
  let mediaId = Number(formData.get("logoMediaId") ?? 0);

  const file = formData.get("logoFile");
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadSectionImage(file, alt);
    if ("error" in uploaded) {
      return { status: "error", message: uploaded.error };
    }
    mediaId = uploaded.mediaId;
  }

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

  const result = await schoolInfoContent.save(input);
  if (result.status !== "success") return result;

  let cacheWarning = false;
  try {
    revalidatePath("/");
    revalidatePath("/news/[slug]", "page");
  } catch {
    cacheWarning = true;
  }
  return { ...result, cacheWarning };
}
