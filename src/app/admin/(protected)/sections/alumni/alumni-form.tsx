"use client";

import { useActionState, useEffect, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  HiddenFileField,
  ImageField,
  RepeatableList,
  TextField,
  TextareaField,
  type ImageFieldValue,
} from "@/components/admin/fields";
import { MediaPickerDialog } from "@/components/admin/media-picker";
import { applySavedUploads } from "@/components/admin/saved-uploads";
import { SaveBar } from "@/components/admin/save-bar";
import { useUnsavedChangesWarning } from "@/components/admin/use-unsaved-changes-warning";
import type { AlumniView } from "@/lib/content/sections/alumni";
import type { SectionSaveResult } from "@/lib/content/sections/types";

import { saveAlumniAction } from "./actions";

const initialActionState: SectionSaveResult | null = null;
const MAX_ACHIEVEMENTS = 24;

type AchievementView = AlumniView["achievements"][number];

interface AchievementForm extends ImageFieldValue {
  name: string;
  batch: string;
  title: string;
  description: string;
}

const NO_PHOTO: ImageFieldValue = {
  mediaId: 0,
  previewUrl: "",
  alt: "",
  pendingFile: null,
};

function hasPhoto(item: ImageFieldValue): boolean {
  return item.mediaId > 0 || item.pendingFile !== null;
}

function toFormAchievement(item: AchievementView): AchievementForm {
  return {
    name: item.name,
    batch: item.batch,
    title: item.title,
    description: item.description,
    mediaId: item.image?.mediaId ?? 0,
    previewUrl: item.image?.url ?? "",
    alt: item.image?.alt ?? "",
    pendingFile: null,
  };
}

function toBaselineItem(item: AchievementForm): AchievementView {
  return {
    name: item.name,
    batch: item.batch,
    title: item.title,
    description: item.description,
    image: hasPhoto(item)
      ? { mediaId: item.mediaId, url: item.previewUrl, alt: item.alt }
      : null,
  };
}

/** The stored shape: `image` exists only while a photo is set. */
function toSubmitted(items: AchievementForm[]) {
  return items.map((item) => ({
    name: item.name,
    batch: item.batch,
    title: item.title,
    description: item.description,
    ...(hasPhoto(item)
      ? { image: { mediaId: item.mediaId, alt: item.alt } }
      : {}),
  }));
}

function snapshot(items: AchievementForm[]): string {
  const submitted = toSubmitted(items);
  return JSON.stringify(
    submitted.map((item, index) => ({
      ...item,
      pending: items[index].pendingFile !== null,
    })),
  );
}

export function AlumniForm({
  initial,
  revision: initialRevision,
}: {
  initial: AlumniView;
  revision: number;
}) {
  const [revision, setRevision] = useState(initialRevision);
  const [baseline, setBaseline] = useState(initial);
  const [sectionLabel, setSectionLabel] = useState(initial.sectionLabel);
  const [heading, setHeading] = useState(initial.heading);
  const [intro, setIntro] = useState(initial.intro);
  const [achievements, setAchievements] = useState<AchievementForm[]>(
    initial.achievements.map(toFormAchievement),
  );

  const [state, formAction, isPending] = useActionState(
    saveAlumniAction,
    initialActionState,
  );

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.success(
        state.cacheWarning
          ? "Saved — the site may take a few minutes to update."
          : "Alumni section saved.",
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
      // Hold the stored media reference instead of the original file.
      const saved = applySavedUploads(achievements, state.uploadedMedia);
      setRevision(state.revision);
      setAchievements(saved);
      setBaseline({
        sectionLabel,
        heading,
        intro,
        achievements: saved.map(toBaselineItem),
      });
    }
  }

  const isDirty =
    sectionLabel !== baseline.sectionLabel ||
    heading !== baseline.heading ||
    intro !== baseline.intro ||
    snapshot(achievements) !==
      snapshot(baseline.achievements.map(toFormAchievement));

  useUnsavedChangesWarning(isDirty);

  const fieldErrors =
    state?.status === "validation_error" ? state.fieldErrors : {};

  const handleDiscard = () => {
    setSectionLabel(baseline.sectionLabel);
    setHeading(baseline.heading);
    setIntro(baseline.intro);
    setAchievements(baseline.achievements.map(toFormAchievement));
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="revision" value={revision} />
      <input
        type="hidden"
        name="achievementsJson"
        value={JSON.stringify(toSubmitted(achievements))}
      />
      {achievements.map(
        (item, index) =>
          item.pendingFile && (
            <HiddenFileField
              key={index}
              name={`achievementFile-${index}`}
              file={item.pendingFile}
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
          label="Alumni achievements"
          helperText="Up to 24 achievements, shown in this order."
          itemLabel="Achievement"
          items={achievements}
          onChange={setAchievements}
          maxItems={MAX_ACHIEVEMENTS}
          emptyText="No achievements yet. Add the first one to show it on the Alumni page."
          createItem={(): AchievementForm => ({
            name: "",
            batch: "",
            title: "",
            description: "",
            ...NO_PHOTO,
          })}
          error={fieldErrors.achievements}
          renderItem={(item, update, index) => {
            const errorFor = (field: string) =>
              fieldErrors[`achievements.${index}.${field}`];
            return (
              <div className="space-y-3">
                <TextField
                  id={`achievement-name-${index}`}
                  label="Alumni name"
                  value={item.name}
                  onChange={(e) => update({ name: e.target.value })}
                  error={errorFor("name")}
                />
                <TextField
                  id={`achievement-batch-${index}`}
                  label="Batch"
                  helperText='For example "Batch 2015" or "Class of 2015".'
                  value={item.batch}
                  onChange={(e) => update({ batch: e.target.value })}
                  error={errorFor("batch")}
                />
                <TextField
                  id={`achievement-title-${index}`}
                  label="Achievement"
                  value={item.title}
                  onChange={(e) => update({ title: e.target.value })}
                  error={errorFor("title")}
                />
                <TextareaField
                  id={`achievement-description-${index}`}
                  label="Description"
                  helperText="Optional."
                  rows={2}
                  value={item.description}
                  onChange={(e) => update({ description: e.target.value })}
                  error={errorFor("description")}
                />
                {hasPhoto(item) ? (
                  <div className="space-y-2">
                    <ImageField
                      label="Photo (optional)"
                      helperText="Alt text is required while a photo is set."
                      recommendedSize="4:3 landscape, at least 800px wide"
                      value={item}
                      onChange={(next) => update(next)}
                      error={errorFor("image.alt") || errorFor("image.mediaId")}
                    />
                    <button
                      type="button"
                      onClick={() => update({ ...NO_PHOTO })}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove photo</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <span className="block text-sm font-bold text-neutral-800">
                      Photo (optional)
                    </span>
                    <div className="mt-2">
                      <MediaPickerDialog
                        title="Choose a photo — Alumni achievement"
                        onSelectExisting={(media) =>
                          update({
                            mediaId: media.mediaId,
                            previewUrl: media.url,
                            pendingFile: null,
                          })
                        }
                        onSelectFiles={(files) => {
                          const file = files[0];
                          if (!file) return;
                          update({
                            mediaId: 0,
                            previewUrl: URL.createObjectURL(file),
                            pendingFile: file,
                          });
                        }}
                        trigger={
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                          >
                            <ImagePlus className="h-3.5 w-3.5" />
                            <span>Add photo</span>
                          </button>
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>

      <SaveBar
        isDirty={isDirty}
        isPending={isPending}
        onDiscard={handleDiscard}
        viewHref="/alumni"
      />
    </form>
  );
}
