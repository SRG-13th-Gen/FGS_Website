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
import type {
  ContactCard,
  ContactContent,
} from "@/lib/content/sections/contact";
import type { SectionSaveResult } from "@/lib/content/sections/types";

import { saveContactAction } from "./actions";

const initialActionState: SectionSaveResult | null = null;

export function ContactForm({
  initial,
  revision: initialRevision,
}: {
  initial: ContactContent;
  revision: number;
}) {
  const [revision, setRevision] = useState(initialRevision);
  const [baseline, setBaseline] = useState(initial);
  const [sectionLabel, setSectionLabel] = useState(initial.sectionLabel);
  const [heading, setHeading] = useState(initial.heading);
  const [intro, setIntro] = useState(initial.intro);
  const [cards, setCards] = useState<ContactCard[]>(initial.cards);

  const [state, formAction, isPending] = useActionState(
    saveContactAction,
    initialActionState,
  );

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.success(
        state.cacheWarning
          ? "Saved — the site may take a few minutes to update."
          : "Contact section saved.",
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
    if (state?.status === "success") setRevision(state.revision);
    if (state?.status === "success") {
      setBaseline({ sectionLabel, heading, intro, cards });
    }
  }

  const isDirty =
    sectionLabel !== baseline.sectionLabel ||
    heading !== baseline.heading ||
    intro !== baseline.intro ||
    JSON.stringify(cards) !== JSON.stringify(baseline.cards);

  useUnsavedChangesWarning(isDirty);

  const fieldErrors =
    state?.status === "validation_error" ? state.fieldErrors : {};

  const handleDiscard = () => {
    setSectionLabel(baseline.sectionLabel);
    setHeading(baseline.heading);
    setIntro(baseline.intro);
    setCards(baseline.cards);
  };

  return (
    <form action={formAction} className="flex flex-1 flex-col justify-between">
      <input type="hidden" name="revision" value={revision} />
      <input type="hidden" name="cardsJson" value={JSON.stringify(cards)} />

      <div className="space-y-6">
        {/* Row 1: Section Heading */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-neutral-800">
            Section Heading
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              id="section-label"
              name="sectionLabel"
              label="Section Label"
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
            <div className="sm:col-span-2">
              <TextareaField
                id="intro"
                name="intro"
                label="Intro Text"
                rows={2}
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                error={fieldErrors.intro}
              />
            </div>
          </div>
        </div>

        {/* Row 2: Contact Cards in Column Format */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
          <RepeatableList
            label="Contact Cards"
            itemLabel="Card"
            items={cards}
            onChange={setCards}
            minItems={1}
            maxItems={6}
            gridClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            createItem={(): ContactCard => ({
              icon: "map-pin",
              title: "",
              detail: "",
              sub: "",
            })}
            error={fieldErrors.cards}
            renderItem={(item, update, index) => (
              <div className="space-y-3">
                <IconPickerField
                  label="Icon"
                  value={item.icon}
                  onChange={(icon) => update({ icon })}
                />
                <TextField
                  id={`card-title-${index}`}
                  label="Title"
                  value={item.title}
                  onChange={(e) => update({ title: e.target.value })}
                />
                <TextField
                  id={`card-detail-${index}`}
                  label="Detail"
                  value={item.detail}
                  onChange={(e) => update({ detail: e.target.value })}
                />
                <TextField
                  id={`card-sub-${index}`}
                  label="Sub Text"
                  value={item.sub}
                  onChange={(e) => update({ sub: e.target.value })}
                />
              </div>
            )}
          />
        </div>
      </div>

      <SaveBar
        isDirty={isDirty}
        isPending={isPending}
        onDiscard={handleDiscard}
        viewHref="/#contact"
      />
    </form>
  );
}
