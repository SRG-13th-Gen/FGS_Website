"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  IconPickerField,
  RepeatableList,
  TextField,
  TextareaField,
} from "@/components/admin/fields";
import { SaveBar } from "@/components/admin/save-bar";
import { useUnsavedChangesWarning } from "@/components/admin/use-unsaved-changes-warning";
import type { ClubItem, ClubsContent } from "@/lib/wordpress/sections/clubs";
import type { SectionSaveResult } from "@/lib/wordpress/sections/types";

import { saveClubsAction } from "./actions";

const initialActionState: SectionSaveResult | null = null;

export function ClubsForm({ initial }: { initial: ClubsContent }) {
  const [baseline, setBaseline] = useState(initial);
  const [sectionLabel, setSectionLabel] = useState(initial.sectionLabel);
  const [heading, setHeading] = useState(initial.heading);
  const [intro, setIntro] = useState(initial.intro);
  const [clubs, setClubs] = useState<ClubItem[]>(initial.clubs);

  const [state, formAction, isPending] = useActionState(
    saveClubsAction,
    initialActionState,
  );

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.success(
        state.cacheWarning
          ? "Saved — the site may take a few minutes to update."
          : "Clubs section saved.",
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
      setBaseline({ sectionLabel, heading, intro, clubs });
    }
  }

  const isDirty =
    sectionLabel !== baseline.sectionLabel ||
    heading !== baseline.heading ||
    intro !== baseline.intro ||
    JSON.stringify(clubs) !== JSON.stringify(baseline.clubs);

  useUnsavedChangesWarning(isDirty);

  const fieldErrors =
    state?.status === "validation_error" ? state.fieldErrors : {};

  const handleDiscard = () => {
    setSectionLabel(baseline.sectionLabel);
    setHeading(baseline.heading);
    setIntro(baseline.intro);
    setClubs(baseline.clubs);
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="clubsJson" value={JSON.stringify(clubs)} />

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
          label="Clubs"
          itemLabel="Club"
          items={clubs}
          onChange={setClubs}
          minItems={1}
          maxItems={16}
          createItem={(): ClubItem => ({
            name: "",
            category: "",
            description: "",
            meetingDay: "",
            icon: "sparkles",
          })}
          error={fieldErrors.clubs}
          renderItem={(item, update, index) => (
            <div className="space-y-3">
              <TextField
                id={`club-name-${index}`}
                label="Name"
                value={item.name}
                onChange={(e) => update({ name: e.target.value })}
              />
              <TextField
                id={`club-category-${index}`}
                label="Category"
                value={item.category}
                onChange={(e) => update({ category: e.target.value })}
              />
              <TextareaField
                id={`club-desc-${index}`}
                label="Description"
                rows={2}
                value={item.description}
                onChange={(e) => update({ description: e.target.value })}
              />
              <TextField
                id={`club-meeting-${index}`}
                label="Meeting day"
                value={item.meetingDay}
                onChange={(e) => update({ meetingDay: e.target.value })}
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

      <SaveBar
        isDirty={isDirty}
        isPending={isPending}
        onDiscard={handleDiscard}
        viewHref="/#clubs"
      />
    </form>
  );
}
