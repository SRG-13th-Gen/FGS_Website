"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  HiddenFileField,
  IconPickerField,
  ImageField,
  RepeatableList,
  StringListField,
  TextField,
  TextareaField,
  type ImageFieldValue,
} from "@/components/admin/fields";
import { SaveBar } from "@/components/admin/save-bar";
import { useUnsavedChangesWarning } from "@/components/admin/use-unsaved-changes-warning";
import type {
  AdmissionEnrollmentStep,
  AdmissionProgram,
  AdmissionRequirementCategory,
  AdmissionView,
} from "@/lib/wordpress/sections/admission";
import type { SectionSaveResult } from "@/lib/wordpress/sections/types";

import { saveAdmissionAction } from "./actions";

const initialActionState: SectionSaveResult | null = null;

function toImageFieldValue(view: AdmissionView): ImageFieldValue {
  return {
    mediaId: view.backgroundImage.mediaId,
    previewUrl: view.backgroundImage.url,
    alt: view.backgroundImage.alt,
    pendingFile: null,
  };
}

export function AdmissionForm({ initial }: { initial: AdmissionView }) {
  const [baseline, setBaseline] = useState(initial);
  const [sectionLabel, setSectionLabel] = useState(initial.sectionLabel);
  const [heading, setHeading] = useState(initial.heading);
  const [intro, setIntro] = useState(initial.intro);
  const [backgroundImage, setBackgroundImage] = useState<ImageFieldValue>(
    toImageFieldValue(initial),
  );
  const [programs, setPrograms] = useState<AdmissionProgram[]>(
    initial.programs,
  );
  const [requirementCategories, setRequirementCategories] = useState<
    AdmissionRequirementCategory[]
  >(initial.requirementCategories);
  const [enrollmentSteps, setEnrollmentSteps] = useState<
    AdmissionEnrollmentStep[]
  >(initial.enrollmentSteps);

  const [state, formAction, isPending] = useActionState(
    saveAdmissionAction,
    initialActionState,
  );

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.success(
        state.cacheWarning
          ? "Saved — the site may take a few minutes to update."
          : "Admission section saved.",
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
        backgroundImage: {
          mediaId: backgroundImage.mediaId,
          url: backgroundImage.previewUrl,
          alt: backgroundImage.alt,
        },
        programs,
        requirementCategories,
        enrollmentSteps,
      });
    }
  }

  const isDirty =
    sectionLabel !== baseline.sectionLabel ||
    heading !== baseline.heading ||
    intro !== baseline.intro ||
    backgroundImage.pendingFile !== null ||
    backgroundImage.mediaId !== baseline.backgroundImage.mediaId ||
    backgroundImage.alt !== baseline.backgroundImage.alt ||
    JSON.stringify(programs) !== JSON.stringify(baseline.programs) ||
    JSON.stringify(requirementCategories) !==
      JSON.stringify(baseline.requirementCategories) ||
    JSON.stringify(enrollmentSteps) !==
      JSON.stringify(baseline.enrollmentSteps);

  useUnsavedChangesWarning(isDirty);

  const fieldErrors =
    state?.status === "validation_error" ? state.fieldErrors : {};

  const handleDiscard = () => {
    setSectionLabel(baseline.sectionLabel);
    setHeading(baseline.heading);
    setIntro(baseline.intro);
    setBackgroundImage(toImageFieldValue(baseline));
    setPrograms(baseline.programs);
    setRequirementCategories(baseline.requirementCategories);
    setEnrollmentSteps(baseline.enrollmentSteps);
  };

  return (
    <form action={formAction} className="space-y-6">
      <input
        type="hidden"
        name="backgroundImageMediaId"
        value={backgroundImage.mediaId}
      />
      <input
        type="hidden"
        name="backgroundImageAlt"
        value={backgroundImage.alt}
      />
      {backgroundImage.pendingFile && (
        <HiddenFileField
          name="backgroundImageFile"
          file={backgroundImage.pendingFile}
        />
      )}
      <input
        type="hidden"
        name="programsJson"
        value={JSON.stringify(programs)}
      />
      <input
        type="hidden"
        name="requirementCategoriesJson"
        value={JSON.stringify(requirementCategories)}
      />
      <input
        type="hidden"
        name="enrollmentStepsJson"
        value={JSON.stringify(enrollmentSteps)}
      />

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-neutral-800">Section heading</h2>
        <div className="mt-4 space-y-4">
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
        <ImageField
          label="Section background photo"
          helperText="Full-bleed decorative photo behind the whole section."
          recommendedSize="1600×900 or larger, landscape"
          value={backgroundImage}
          onChange={setBackgroundImage}
          error={
            fieldErrors["backgroundImage.mediaId"] ||
            fieldErrors["backgroundImage.alt"]
          }
        />
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <RepeatableList
          label="Programs"
          itemLabel="Program"
          items={programs}
          onChange={setPrograms}
          minItems={1}
          maxItems={6}
          createItem={(): AdmissionProgram => ({
            name: "",
            levelLabel: "",
            description: "",
            icon: "blocks",
          })}
          error={fieldErrors.programs}
          renderItem={(item, update, index) => (
            <div className="space-y-3">
              <TextField
                id={`program-name-${index}`}
                label="Name"
                value={item.name}
                onChange={(e) => update({ name: e.target.value })}
              />
              <TextField
                id={`program-level-${index}`}
                label="Level label"
                value={item.levelLabel}
                onChange={(e) => update({ levelLabel: e.target.value })}
              />
              <TextareaField
                id={`program-desc-${index}`}
                label="Description"
                rows={2}
                value={item.description}
                onChange={(e) => update({ description: e.target.value })}
              />
              <IconPickerField
                label="Icon"
                value={item.icon}
                onChange={(icon) => update({ icon })}
              />
            </div>
          )}
        />
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <RepeatableList
          label="Requirement categories"
          helperText="One card per student type (e.g. Old, New, Transferee)."
          itemLabel="Category"
          items={requirementCategories}
          onChange={setRequirementCategories}
          minItems={1}
          maxItems={6}
          createItem={() => ({ badgeLabel: "", title: "", items: [""] })}
          error={fieldErrors.requirementCategories}
          renderItem={(item, update, index) => (
            <div className="space-y-3">
              <TextField
                id={`req-badge-${index}`}
                label="Badge label"
                value={item.badgeLabel}
                onChange={(e) => update({ badgeLabel: e.target.value })}
              />
              <TextField
                id={`req-title-${index}`}
                label="Title"
                value={item.title}
                onChange={(e) => update({ title: e.target.value })}
              />
              <StringListField
                label="Requirements"
                itemLabel="Requirement"
                values={item.items}
                onChange={(items) => update({ items })}
              />
            </div>
          )}
        />
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <RepeatableList
          label="Enrollment steps"
          helperText="Numbered automatically (01, 02, 03…) by order."
          itemLabel="Step"
          items={enrollmentSteps}
          onChange={setEnrollmentSteps}
          minItems={1}
          maxItems={8}
          createItem={() => ({ title: "", description: "" })}
          error={fieldErrors.enrollmentSteps}
          renderItem={(item, update, index) => (
            <div className="space-y-3">
              <TextField
                id={`step-title-${index}`}
                label="Title"
                value={item.title}
                onChange={(e) => update({ title: e.target.value })}
              />
              <TextareaField
                id={`step-desc-${index}`}
                label="Description"
                rows={2}
                value={item.description}
                onChange={(e) => update({ description: e.target.value })}
              />
            </div>
          )}
        />
      </div>

      <SaveBar
        isDirty={isDirty}
        isPending={isPending}
        onDiscard={handleDiscard}
        viewHref="/#admission"
      />
    </form>
  );
}
