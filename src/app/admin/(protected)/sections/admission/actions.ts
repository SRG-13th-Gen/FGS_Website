"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import type { AdmissionContent } from "@/lib/wordpress/sections/admission";
import { admissionContent } from "@/lib/wordpress/sections/content";
import { uploadSectionImage } from "@/lib/wordpress/sections/media";
import type { SectionSaveResult } from "@/lib/wordpress/sections/types";

function parseJsonField<T>(formData: FormData, name: string, fallback: T): T {
  const raw = formData.get(name);
  if (typeof raw !== "string" || !raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveAdmissionAction(
  _prevState: SectionSaveResult | null,
  formData: FormData,
): Promise<SectionSaveResult> {
  await requireAdmin();

  const bgAlt = String(formData.get("backgroundImageAlt") ?? "");
  let bgMediaId = Number(formData.get("backgroundImageMediaId") ?? 0);

  const file = formData.get("backgroundImageFile");
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadSectionImage(file, bgAlt);
    if ("error" in uploaded) {
      return { status: "error", message: uploaded.error };
    }
    bgMediaId = uploaded.mediaId;
  }

  const input: AdmissionContent = {
    sectionLabel: String(formData.get("sectionLabel") ?? ""),
    heading: String(formData.get("heading") ?? ""),
    intro: String(formData.get("intro") ?? ""),
    backgroundImage: { mediaId: bgMediaId, alt: bgAlt },
    programs: parseJsonField(formData, "programsJson", []),
    requirementCategories: parseJsonField(
      formData,
      "requirementCategoriesJson",
      [],
    ),
    enrollmentSteps: parseJsonField(formData, "enrollmentStepsJson", []),
  };

  const result = await admissionContent.save(input);
  if (result.status !== "success") return result;

  let cacheWarning = false;
  try {
    revalidatePath("/");
  } catch {
    cacheWarning = true;
  }
  return { ...result, cacheWarning };
}
