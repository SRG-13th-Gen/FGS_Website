"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  HiddenFileField,
  ImageField,
  TextField,
  TextareaField,
  type ImageFieldValue,
} from "@/components/admin/fields";
import { applySavedImage } from "@/components/admin/saved-uploads";
import { SaveBar } from "@/components/admin/save-bar";
import { useUnsavedChangesWarning } from "@/components/admin/use-unsaved-changes-warning";
import type { HeroView } from "@/lib/content/sections/hero";
import type { SectionSaveResult } from "@/lib/content/sections/types";

import { saveHeroAction } from "./actions";

const initialActionState: SectionSaveResult | null = null;

function toImageFieldValue(view: HeroView): ImageFieldValue {
  return {
    mediaId: view.backgroundImage.mediaId,
    previewUrl: view.backgroundImage.url,
    alt: view.backgroundImage.alt,
    pendingFile: null,
  };
}

export function HeroForm({
  initial,
  revision: initialRevision,
}: {
  initial: HeroView;
  revision: number;
}) {
  const [revision, setRevision] = useState(initialRevision);
  const [baseline, setBaseline] = useState(initial);
  const [heading, setHeading] = useState(initial.heading);
  const [tagline, setTagline] = useState(initial.tagline);
  const [image, setImage] = useState<ImageFieldValue>(
    toImageFieldValue(initial),
  );

  const [state, formAction, isPending] = useActionState(
    saveHeroAction,
    initialActionState,
  );

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.success(
        state.cacheWarning
          ? "Saved — the site may take a few minutes to update."
          : "Hero section saved.",
      );
    } else if (state.status === "error") {
      toast.error(state.message);
    } else if (state.status === "uncertain") {
      toast.warning(state.message);
    } else if (state.status === "validation_error") {
      toast.error("Please fix the highlighted fields.");
    }
  }, [state]);

  // Record the just-saved values as the new baseline, at render time so the
  // save bar disables immediately (no extra effect-triggered render).
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.status === "success") {
      // Hold the stored media reference instead of the original file.
      const saved = applySavedImage(image, state.uploadedMedia);
      setRevision(state.revision);
      setImage(saved);
      setBaseline({
        heading,
        tagline,
        backgroundImage: {
          mediaId: saved.mediaId,
          url: saved.previewUrl,
          alt: saved.alt,
        },
      });
    }
  }

  useUnsavedChangesWarning(
    heading !== baseline.heading ||
      tagline !== baseline.tagline ||
      image.pendingFile !== null ||
      image.mediaId !== baseline.backgroundImage.mediaId ||
      image.alt !== baseline.backgroundImage.alt,
  );

  const isDirty =
    heading !== baseline.heading ||
    tagline !== baseline.tagline ||
    image.pendingFile !== null ||
    image.mediaId !== baseline.backgroundImage.mediaId ||
    image.alt !== baseline.backgroundImage.alt;

  const fieldErrors =
    state?.status === "validation_error" ? state.fieldErrors : {};

  const handleDiscard = () => {
    setHeading(baseline.heading);
    setTagline(baseline.tagline);
    setImage(toImageFieldValue(baseline));
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="revision" value={revision} />
      <input
        type="hidden"
        name="backgroundImageMediaId"
        value={image.mediaId}
      />
      <input type="hidden" name="backgroundImageAlt" value={image.alt} />
      {image.pendingFile && (
        <HiddenFileField name="backgroundImageFile" file={image.pendingFile} />
      )}

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <TextareaField
          id="hero-heading"
          name="heading"
          label="Heading"
          helperText="Shown as the big heading at the top of the homepage. Press Enter for a line break."
          rows={2}
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          error={fieldErrors.heading}
        />
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <TextField
          id="hero-tagline"
          name="tagline"
          label="Tagline"
          helperText="Shown in italics under the heading."
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          error={fieldErrors.tagline}
        />
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <ImageField
          label="Background image"
          helperText="Full-bleed photo behind the hero heading."
          recommendedSize="1920×1080 or larger, landscape"
          value={image}
          onChange={setImage}
          error={
            fieldErrors["backgroundImage.mediaId"] ||
            fieldErrors["backgroundImage.alt"]
          }
        />
      </div>

      <SaveBar
        isDirty={isDirty}
        isPending={isPending}
        onDiscard={handleDiscard}
        viewHref="/#home"
      />
    </form>
  );
}
