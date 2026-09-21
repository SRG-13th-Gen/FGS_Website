"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  HiddenFileField,
  ImageField,
  StringListField,
  TextField,
  TextareaField,
  type ImageFieldValue,
} from "@/components/admin/fields";
import { SaveBar } from "@/components/admin/save-bar";
import { useUnsavedChangesWarning } from "@/components/admin/use-unsaved-changes-warning";
import type { AboutView } from "@/lib/wordpress/sections/about";
import type { SectionSaveResult } from "@/lib/wordpress/sections/types";

import { saveAboutAction } from "./actions";

const initialActionState: SectionSaveResult | null = null;

function toImageFieldValue(view: AboutView): ImageFieldValue {
  return {
    mediaId: view.featureBanner.image.mediaId,
    previewUrl: view.featureBanner.image.url,
    alt: view.featureBanner.image.alt,
    pendingFile: null,
  };
}

export function AboutForm({ initial }: { initial: AboutView }) {
  const [baseline, setBaseline] = useState(initial);
  const [sectionLabel, setSectionLabel] = useState(initial.sectionLabel);
  const [heading, setHeading] = useState(initial.heading);
  const [storyParagraphs, setStoryParagraphs] = useState(
    initial.storyParagraphs,
  );
  const [mission, setMission] = useState(initial.mission);
  const [vision, setVision] = useState(initial.vision);
  const [quoteText, setQuoteText] = useState(initial.quote.text);
  const [quoteAuthor, setQuoteAuthor] = useState(initial.quote.author);
  const [bannerHeading, setBannerHeading] = useState(
    initial.featureBanner.heading,
  );
  const [bannerBody, setBannerBody] = useState(initial.featureBanner.body);
  const [bannerImage, setBannerImage] = useState<ImageFieldValue>(
    toImageFieldValue(initial),
  );

  const [state, formAction, isPending] = useActionState(
    saveAboutAction,
    initialActionState,
  );

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.success(
        state.cacheWarning
          ? "Saved — the site may take a few minutes to update."
          : "About section saved.",
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
        storyParagraphs,
        mission,
        vision,
        quote: { text: quoteText, author: quoteAuthor },
        featureBanner: {
          heading: bannerHeading,
          body: bannerBody,
          image: {
            mediaId: bannerImage.mediaId,
            url: bannerImage.previewUrl,
            alt: bannerImage.alt,
          },
        },
      });
    }
  }

  const isDirty =
    sectionLabel !== baseline.sectionLabel ||
    heading !== baseline.heading ||
    JSON.stringify(storyParagraphs) !==
      JSON.stringify(baseline.storyParagraphs) ||
    mission !== baseline.mission ||
    vision !== baseline.vision ||
    quoteText !== baseline.quote.text ||
    quoteAuthor !== baseline.quote.author ||
    bannerHeading !== baseline.featureBanner.heading ||
    bannerBody !== baseline.featureBanner.body ||
    bannerImage.pendingFile !== null ||
    bannerImage.alt !== baseline.featureBanner.image.alt;

  useUnsavedChangesWarning(isDirty);

  const fieldErrors =
    state?.status === "validation_error" ? state.fieldErrors : {};

  const handleDiscard = () => {
    setSectionLabel(baseline.sectionLabel);
    setHeading(baseline.heading);
    setStoryParagraphs(baseline.storyParagraphs);
    setMission(baseline.mission);
    setVision(baseline.vision);
    setQuoteText(baseline.quote.text);
    setQuoteAuthor(baseline.quote.author);
    setBannerHeading(baseline.featureBanner.heading);
    setBannerBody(baseline.featureBanner.body);
    setBannerImage(toImageFieldValue(baseline));
  };

  return (
    <form action={formAction} className="space-y-6">
      <input
        type="hidden"
        name="bannerImageMediaId"
        value={bannerImage.mediaId}
      />
      <input type="hidden" name="bannerImageAlt" value={bannerImage.alt} />
      {bannerImage.pendingFile && (
        <HiddenFileField
          name="bannerImageFile"
          file={bannerImage.pendingFile}
        />
      )}
      {storyParagraphs.map((paragraph, index) => (
        <input
          key={index}
          type="hidden"
          name="storyParagraphs"
          value={paragraph}
        />
      ))}

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-neutral-800">
          Montessori quote band
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Shown in a quiet band between the hero and the classroom photo banner.
        </p>
        <div className="mt-4 space-y-4">
          <TextareaField
            id="quote-text"
            name="quoteText"
            label="Quote"
            rows={2}
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            error={fieldErrors["quote.text"]}
          />
          <TextField
            id="quote-author"
            name="quoteAuthor"
            label="Attributed to"
            value={quoteAuthor}
            onChange={(e) => setQuoteAuthor(e.target.value)}
            error={fieldErrors["quote.author"]}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-neutral-800">
          Classroom feature banner
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          The full-bleed photo banner shown right after the quote band.
        </p>
        <div className="mt-4 space-y-4">
          <TextField
            id="banner-heading"
            name="bannerHeading"
            label="Heading"
            value={bannerHeading}
            onChange={(e) => setBannerHeading(e.target.value)}
            error={fieldErrors["featureBanner.heading"]}
          />
          <TextareaField
            id="banner-body"
            name="bannerBody"
            label="Body text"
            rows={2}
            value={bannerBody}
            onChange={(e) => setBannerBody(e.target.value)}
            error={fieldErrors["featureBanner.body"]}
          />
          <ImageField
            label="Banner photo"
            recommendedSize="1600×900 or larger, landscape"
            value={bannerImage}
            onChange={setBannerImage}
            error={
              fieldErrors["featureBanner.image.mediaId"] ||
              fieldErrors["featureBanner.image.alt"]
            }
          />
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-neutral-800">About Us section</h2>
        <div className="mt-4 space-y-4">
          <TextField
            id="section-label"
            name="sectionLabel"
            label="Section label"
            helperText="Small uppercase label above the heading."
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
          <StringListField
            label="Story paragraphs"
            helperText="Shown in reading order, automatically balanced into two columns."
            values={storyParagraphs}
            onChange={setStoryParagraphs}
            itemLabel="Paragraph"
            error={fieldErrors.storyParagraphs}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
          <TextareaField
            id="mission"
            name="mission"
            label="Mission"
            rows={4}
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            error={fieldErrors.mission}
          />
        </div>
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
          <TextareaField
            id="vision"
            name="vision"
            label="Vision"
            rows={4}
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            error={fieldErrors.vision}
          />
        </div>
      </div>

      <SaveBar
        isDirty={isDirty}
        isPending={isPending}
        onDiscard={handleDiscard}
        viewHref="/#about"
      />
    </form>
  );
}
