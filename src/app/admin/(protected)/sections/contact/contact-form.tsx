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
} from "@/lib/wordpress/sections/contact";
import type { SectionSaveResult } from "@/lib/wordpress/sections/types";

import { saveContactAction } from "./actions";

const initialActionState: SectionSaveResult | null = null;

export function ContactForm({ initial }: { initial: ContactContent }) {
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
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="cardsJson" value={JSON.stringify(cards)} />

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
          label="Contact cards"
          itemLabel="Card"
          items={cards}
          onChange={setCards}
          minItems={1}
          maxItems={6}
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
                label="Sub text"
                value={item.sub}
                onChange={(e) => update({ sub: e.target.value })}
              />
            </div>
          )}
        />
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
