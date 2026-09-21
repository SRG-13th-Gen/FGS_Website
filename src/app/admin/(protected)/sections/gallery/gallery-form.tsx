"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  HiddenFileField,
  ImageField,
  RepeatableList,
  TextField,
  TextareaField,
  type ImageFieldValue,
} from "@/components/admin/fields";
import { SaveBar } from "@/components/admin/save-bar";
import { useUnsavedChangesWarning } from "@/components/admin/use-unsaved-changes-warning";
import type { GalleryView } from "@/lib/wordpress/sections/gallery";
import type { SectionSaveResult } from "@/lib/wordpress/sections/types";

import { saveGalleryAction } from "./actions";

const initialActionState: SectionSaveResult | null = null;

interface GalleryPhotoForm extends ImageFieldValue {
  caption: string;
}

function toFormPhoto(photo: GalleryView["photos"][number]): GalleryPhotoForm {
  return {
    mediaId: photo.image.mediaId,
    previewUrl: photo.image.url,
    alt: photo.image.alt,
    pendingFile: null,
    caption: photo.caption,
  };
}

function normalize(photos: GalleryPhotoForm[]) {
  return photos.map((p) => ({
    mediaId: p.mediaId,
    alt: p.alt,
    caption: p.caption,
    pending: p.pendingFile !== null,
  }));
}

export function GalleryForm({ initial }: { initial: GalleryView }) {
  const [baseline, setBaseline] = useState(initial);
  const [sectionLabel, setSectionLabel] = useState(initial.sectionLabel);
  const [heading, setHeading] = useState(initial.heading);
  const [intro, setIntro] = useState(initial.intro);
  const [photos, setPhotos] = useState<GalleryPhotoForm[]>(
    initial.photos.map(toFormPhoto),
  );

  const [state, formAction, isPending] = useActionState(
    saveGalleryAction,
    initialActionState,
  );

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.success(
        state.cacheWarning
          ? "Saved — the site may take a few minutes to update."
          : "Gallery section saved.",
      );
    } else if (state.status === "error") {
      toast.error(state.message);
    } else if (state.status === "uncertain") {
      toast.warning(state.message);
    } else if (state.status === "validation_error") {
      toast.error("Please fix the highlighted fields.");
    }
  }, [state]);

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.status === "success") {
      setBaseline({
        sectionLabel,
        heading,
        intro,
        photos: photos.map((p) => ({
          image: { mediaId: p.mediaId, url: p.previewUrl, alt: p.alt },
          caption: p.caption,
        })),
      });
    }
  }

  const isDirty =
    sectionLabel !== baseline.sectionLabel ||
    heading !== baseline.heading ||
    intro !== baseline.intro ||
    JSON.stringify(normalize(photos)) !==
      JSON.stringify(normalize(baseline.photos.map(toFormPhoto)));

  useUnsavedChangesWarning(isDirty);

  const fieldErrors =
    state?.status === "validation_error" ? state.fieldErrors : {};

  const handleDiscard = () => {
    setSectionLabel(baseline.sectionLabel);
    setHeading(baseline.heading);
    setIntro(baseline.intro);
    setPhotos(baseline.photos.map(toFormPhoto));
  };

  return (
    <form action={formAction} className="space-y-6">
      <input
        type="hidden"
        name="photosJson"
        value={JSON.stringify(
          photos.map((p) => ({
            mediaId: p.mediaId,
            alt: p.alt,
            caption: p.caption,
          })),
        )}
      />
      {photos.map(
        (photo, index) =>
          photo.pendingFile && (
            <HiddenFileField
              key={index}
              name={`photoFile-${index}`}
              file={photo.pendingFile}
            />
          ),
      )}

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <TextField
            id="section-label"
            name="sectionLabel"
            label="Section label"
            value={sectionLabel}
            onChange={(e) => setSectionLabel(e.target.value)}
            error={fieldErrors.sectionLabel}
          />
          <TextField
            id="heading"
            name="heading"
            label="Heading"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            error={fieldErrors.heading}
          />
          <TextareaField
            id="intro"
            name="intro"
            label="Intro text"
            rows={2}
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            error={fieldErrors.intro}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <RepeatableList
          label="Photos"
          helperText="Shown 5 at a time (1 large + 4 small), with further sets revealed via View More on the homepage."
          itemLabel="Photo"
          items={photos}
          onChange={setPhotos}
          maxItems={30}
          createItem={(): GalleryPhotoForm => ({
            mediaId: 0,
            previewUrl: "",
            alt: "",
            pendingFile: null,
            caption: "",
          })}
          error={fieldErrors.photos}
          renderItem={(item, update, index) => (
            <div className="space-y-3">
              <ImageField
                label="Photo"
                recommendedSize="Square or landscape, at least 800px wide"
                value={{
                  mediaId: item.mediaId,
                  previewUrl: item.previewUrl,
                  alt: item.alt,
                  pendingFile: item.pendingFile,
                }}
                onChange={(next) => update(next)}
                error={
                  fieldErrors[`photos.${index}.image.mediaId`] ||
                  fieldErrors[`photos.${index}.image.alt`]
                }
              />
              <TextField
                id={`photo-caption-${index}`}
                label="Caption"
                helperText="Optional. Shown as an overlay on the photo."
                value={item.caption}
                onChange={(e) => update({ caption: e.target.value })}
                error={fieldErrors[`photos.${index}.caption`]}
              />
            </div>
          )}
        />
      </div>

      <SaveBar
        isDirty={isDirty}
        isPending={isPending}
        onDiscard={handleDiscard}
        viewHref="/#gallery"
      />
    </form>
  );
}
