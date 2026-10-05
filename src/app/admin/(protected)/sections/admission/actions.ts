"use server";

import { revalidatePath } from "next/cache";

import {
  checkSectionRevision,
  zodIssuesToFieldErrors,
} from "@/lib/content/sections/adapter";

import { requireAdmin } from "@/lib/auth/require-admin";
import type { AdmissionContent } from "@/lib/content/sections/admission";
import { admissionContent } from "@/lib/content/sections/content";
import { uploadSectionImage } from "@/lib/content/sections/media";
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

export async function saveAdmissionAction(
  _prevState: SectionSaveResult | null,
  formData: FormData,
): Promise<SectionSaveResult> {
  await requireAdmin();
  const revisionError = await checkSectionRevision(
    "site-admission",
    Number(formData.get("revision")),
  );
  if (revisionError) return { status: "error", message: revisionError };

  const bgAlt = String(formData.get("backgroundImageAlt") ?? "");
  const bgMediaId = Number(formData.get("backgroundImageMediaId") ?? 0);

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

  const file = formData.get("backgroundImageFile");
  const draft = structuredClone(input);
  if (file instanceof File && file.size > 0) draft.backgroundImage.mediaId = 1;
  const parsed = admissionContent.schema.safeParse(draft);
  if (!parsed.success)
    return {
      status: "validation_error",
      fieldErrors: zodIssuesToFieldErrors(parsed.error),
    };
  let uploadedMedia: Record<number, number> | undefined;
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadSectionImage(file, bgAlt);
    if ("error" in uploaded) {
      return { status: "error", message: uploaded.error };
    }
    input.backgroundImage.mediaId = uploaded.mediaId;
    uploadedMedia = { 0: uploaded.mediaId };
  }

  const result = await admissionContent.save(
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
  return { ...result, cacheWarning, uploadedMedia };
}
