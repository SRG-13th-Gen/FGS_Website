"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  ArticleCategoryPicker,
  ArticlePictureEditor,
  ArticlePictureFormFields,
  type ArticlePicture,
} from "@/components/admin/article-fields";
import { SaveBar } from "@/components/admin/save-bar";
import { useUnsavedChangesWarning } from "@/components/admin/use-unsaved-changes-warning";
import type { EditableArticle } from "@/lib/wordpress/admin-articles";
import type { ArticleCategorySlug } from "@/lib/wordpress/types";
import type { PublishArticleResult } from "@/lib/wordpress/types";

import { updateArticleAction } from "./actions";

const initialActionState: PublishArticleResult | null = null;

function toPictures(article: EditableArticle): ArticlePicture[] {
  return article.images.map((image) => ({
    id: image.clientId,
    file: null,
    previewUrl: image.url,
    caption: image.caption,
    altText: image.alt,
    existingMediaId: image.mediaId,
  }));
}

function normalize(pictures: ArticlePicture[]) {
  return pictures.map((p) => ({
    mediaId: p.existingMediaId,
    hasNewFile: p.file !== null,
    caption: p.caption,
    altText: p.altText,
  }));
}

export function EditArticleForm({ initial }: { initial: EditableArticle }) {
  const boundAction = updateArticleAction.bind(null, initial.id);

  const [baseline, setBaseline] = useState(initial);
  const [title, setTitle] = useState(initial.title);
  const [category, setCategory] = useState<ArticleCategorySlug>(
    initial.category ?? "announcements",
  );
  const [body, setBody] = useState(initial.body);
  const [pictures, setPictures] = useState<ArticlePicture[]>(
    toPictures(initial),
  );

  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialActionState,
  );

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.success(
        state.cacheWarning
          ? "Saved — the site may take a few minutes to update."
          : "Article saved.",
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
      const nextBaseline: EditableArticle = {
        id: initial.id,
        slug: initial.slug,
        title,
        category,
        body,
        images: pictures.map((p) => ({
          clientId: p.id,
          mediaId:
            p.existingMediaId ??
            state.uploadedImages.find((u) => u.clientId === p.id)?.mediaId ??
            0,
          url: p.previewUrl,
          alt: p.altText,
          caption: p.caption,
        })),
      };
      setBaseline(nextBaseline);
      setPictures(toPictures(nextBaseline));
    } else if (state && state.uploadedImages.length > 0) {
      setPictures((prev) =>
        prev.map((pic) => {
          const uploaded = state.uploadedImages.find(
            (ref) => ref.clientId === pic.id,
          );
          return uploaded ? { ...pic, existingMediaId: uploaded.mediaId } : pic;
        }),
      );
    }
  }

  const isDirty =
    title !== baseline.title ||
    category !== (baseline.category ?? "announcements") ||
    body !== baseline.body ||
    JSON.stringify(normalize(pictures)) !==
      JSON.stringify(normalize(toPictures(baseline)));

  useUnsavedChangesWarning(isDirty);

  const fieldErrors =
    state?.status === "validation_error" ? state.fieldErrors : {};

  const handleDiscard = () => {
    setTitle(baseline.title);
    setCategory(baseline.category ?? "announcements");
    setBody(baseline.body);
    setPictures(toPictures(baseline));
  };

  return (
    <form action={formAction} className="space-y-6">
      <ArticlePictureFormFields pictures={pictures} />

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <label
          htmlFor="article-title"
          className="block text-sm font-bold text-neutral-800"
        >
          Article Title <span className="text-red-500">*</span>
        </label>
        <input
          id="article-title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-2.5 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-school-green focus:bg-white focus:ring-2 focus:ring-school-green/20 focus:outline-none"
          aria-invalid={Boolean(fieldErrors.title)}
          required
        />
        {fieldErrors.title && (
          <p className="mt-2 text-xs font-medium text-red-600">
            {fieldErrors.title}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <input type="hidden" name="category" value={category} />
        <ArticleCategoryPicker
          value={category}
          onChange={setCategory}
          error={fieldErrors.category}
        />
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <label
          htmlFor="article-body"
          className="block text-sm font-bold text-neutral-800"
        >
          Article Body <span className="text-red-500">*</span>
        </label>
        <textarea
          id="article-body"
          name="body"
          rows={10}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-3.5 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 text-sm leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:border-school-green focus:bg-white focus:ring-2 focus:ring-school-green/20 focus:outline-none"
          aria-invalid={Boolean(fieldErrors.body)}
          required
        />
        {fieldErrors.body && (
          <p className="mt-2 text-xs font-medium text-red-600">
            {fieldErrors.body}
          </p>
        )}
      </div>

      <ArticlePictureEditor
        pictures={pictures}
        onChange={setPictures}
        error={fieldErrors.images}
      />

      <SaveBar
        isDirty={isDirty}
        isPending={isPending}
        onDiscard={handleDiscard}
        viewHref={`/news/${initial.slug}`}
      />
    </form>
  );
}
