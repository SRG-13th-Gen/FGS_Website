"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  PenLine,
  Megaphone,
  Calendar,
  Sparkles,
  Star,
  Info,
  ExternalLink,
} from "lucide-react";

import type { PublishArticleResult } from "@/lib/wordpress/types";
import { publishArticleAction } from "./publish-actions";

export type ArticleCategory = "announcements" | "events" | "clubs";

export interface UploadedPicture {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
  altText: string;
  /** Set once this slot has been uploaded to WordPress, so a retry reuses it. */
  uploadedMediaId: number | null;
}

const CATEGORIES: Array<{
  id: ArticleCategory;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  {
    id: "announcements",
    name: "Announcements",
    description:
      "Official school advisories, enrollment updates, schedule alerts",
    icon: Megaphone,
    color: "border-blue-500/30 bg-blue-50 text-blue-700",
  },
  {
    id: "events",
    name: "Events",
    description: "Celebrations, ceremonies, gatherings, and milestones",
    icon: Calendar,
    color: "border-school-green/30 bg-school-green-light text-school-green",
  },
  {
    id: "clubs",
    name: "Clubs",
    description: "Student clubs, workshops, activities, and exhibits",
    icon: Sparkles,
    color: "border-amber-500/30 bg-amber-50 text-amber-700",
  },
];

const initialState: PublishArticleResult | null = null;

/** Programmatically attaches `file` to a hidden file input via DataTransfer, so it rides along with the native form submission. */
function PictureFileField({
  clientId,
  file,
}: {
  clientId: string;
  file: File;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    inputRef.current.files = dataTransfer.files;
  }, [file]);

  return (
    <input
      ref={inputRef}
      type="file"
      name={`image-file-${clientId}`}
      className="hidden"
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}

export default function AdminPage() {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ArticleCategory>("announcements");
  const [body, setBody] = useState("");
  const [pictures, setPictures] = useState<UploadedPicture[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [state, formAction, isPending] = useActionState(
    publishArticleAction,
    initialState,
  );

  // Reconcile server results when a new one arrives: keep already-uploaded
  // images on retry, reset the form on success. Handled at render time
  // (React's "adjusting state when a value changes" pattern) rather than in
  // an effect, so it doesn't cascade an extra render.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.status === "success") {
      setTitle("");
      setBody("");
      setCategory("announcements");
      pictures.forEach((pic) => URL.revokeObjectURL(pic.previewUrl));
      setPictures([]);
    } else if (state && state.uploadedImages.length > 0) {
      setPictures((prev) =>
        prev.map((pic) => {
          const uploaded = state.uploadedImages.find(
            (ref) => ref.clientId === pic.id,
          );
          return uploaded ? { ...pic, uploadedMediaId: uploaded.mediaId } : pic;
        }),
      );
    }
  }

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPictures: UploadedPicture[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      caption: "",
      altText: "",
      uploadedMediaId: null,
    }));

    setPictures((prev) => [...prev, ...newPictures]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCaptionChange = (id: string, newCaption: string) => {
    setPictures((prev) =>
      prev.map((pic) =>
        pic.id === id ? { ...pic, caption: newCaption } : pic,
      ),
    );
  };

  const handleAltTextChange = (id: string, newAltText: string) => {
    setPictures((prev) =>
      prev.map((pic) =>
        pic.id === id ? { ...pic, altText: newAltText } : pic,
      ),
    );
  };

  const handleRemovePicture = (id: string) => {
    setPictures((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((pic) => pic.id !== id);
    });
  };

  const handleSetAsCover = (index: number) => {
    if (index === 0) return;
    setPictures((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  const fieldErrors =
    state?.status === "validation_error" ? state.fieldErrors : {};

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Post New Article
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Publish school stories, club updates, and official announcements.
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="inline-flex rounded-xl border border-neutral-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "edit"
                ? "bg-school-green text-white shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <PenLine className="h-3.5 w-3.5" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "preview"
                ? "bg-school-green text-white shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {state && (
        <div
          role={state.status === "success" ? "status" : "alert"}
          aria-live="polite"
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : state.status === "uncertain"
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.status === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <div className="flex-1 font-medium">
            {state.status === "success" && (
              <>
                <p>
                  {state.cacheWarning
                    ? "Published, but the site may take a few minutes to update."
                    : "Article published successfully!"}
                </p>
                <Link
                  href={state.articlePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-emerald-700 underline hover:text-emerald-900"
                >
                  <span>View published article</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
            {state.status === "validation_error" && (
              <p>Please fix the highlighted fields below.</p>
            )}
            {state.status === "error" && <p>{state.message}</p>}
            {state.status === "uncertain" && <p>{state.message}</p>}
          </div>
        </div>
      )}

      {/* Tab: Editor View */}
      {activeTab === "edit" ? (
        <form action={formAction} className="grid gap-8 lg:grid-cols-3">
          <input
            type="hidden"
            name="imageIds"
            value={pictures.map((p) => p.id).join(",")}
          />
          {pictures.map((pic) => (
            <div key={pic.id} className="hidden">
              <input
                type="hidden"
                name={`image-caption-${pic.id}`}
                value={pic.caption}
                readOnly
              />
              <input
                type="hidden"
                name={`image-alt-${pic.id}`}
                value={pic.altText}
                readOnly
              />
              {pic.uploadedMediaId ? (
                <input
                  type="hidden"
                  name={`image-existingId-${pic.id}`}
                  value={pic.uploadedMediaId}
                  readOnly
                />
              ) : (
                <PictureFileField clientId={pic.id} file={pic.file} />
              )}
            </div>
          ))}

          {/* Main Content Columns (2 cols on desktop) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Title Input */}
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
                placeholder="e.g., Annual Science Fair & Robotics Exhibition 2026"
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

            {/* Category Selector */}
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
              <label className="block text-sm font-bold text-neutral-800">
                Category <span className="text-red-500">*</span>
              </label>
              <p className="mt-1 text-xs text-neutral-500">
                Select where this article will be published on the website.
              </p>
              <input type="hidden" name="category" value={category} />

              <div className="mt-3.5 grid gap-3 sm:grid-cols-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-school-green bg-school-green-light/40 shadow-sm ring-2 ring-school-green/20"
                          : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-lg ${cat.color}`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="font-semibold text-neutral-900">
                          {cat.name}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                        {cat.description}
                      </p>
                    </button>
                  );
                })}
              </div>
              {fieldErrors.category && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {fieldErrors.category}
                </p>
              )}
            </div>

            {/* Body Content */}
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
              <label
                htmlFor="article-body"
                className="block text-sm font-bold text-neutral-800"
              >
                Article Body <span className="text-red-500">*</span>
              </label>
              <p className="mt-1 text-xs text-neutral-500">
                Write the full story, announcement details, or event schedule.
              </p>
              <textarea
                id="article-body"
                name="body"
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share the full details of this announcement or story..."
                className="mt-3.5 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 text-sm leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:border-school-green focus:bg-white focus:ring-2 focus:ring-school-green/20 focus:outline-none"
                aria-invalid={Boolean(fieldErrors.body)}
                required
              />
              <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                <span>Supports multi-paragraph stories</span>
                <span>{body.length} characters</span>
              </div>
              {fieldErrors.body && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {fieldErrors.body}
                </p>
              )}
            </div>

            {/* Pictures & Individual Captions */}
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-bold text-neutral-800">
                    Article Pictures &amp; Captions
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Upload photos for your article. Each photo can have its own
                    custom caption and alt text.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 sm:mt-0"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Upload Photos</span>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                id={fileInputId}
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Upload Dropzone (when empty) */}
              {pictures.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center transition-colors hover:border-school-green hover:bg-neutral-50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-school-green-light text-school-green">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-neutral-800">
                    Click to select pictures
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    PNG, JPG, WebP, or AVIF (Up to 10MB per image)
                  </p>
                </div>
              ) : (
                /* Uploaded Pictures with per-picture caption fields */
                <div className="mt-5 space-y-4">
                  {pictures.map((pic, index) => {
                    const isCover = index === 0;
                    return (
                      <div
                        key={pic.id}
                        className="flex flex-col gap-4 rounded-xl border border-neutral-200/90 bg-neutral-50/50 p-4 sm:flex-row sm:items-start"
                      >
                        {/* Thumbnail */}
                        <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:h-28 sm:w-36">
                          <Image
                            src={pic.previewUrl}
                            alt={
                              pic.altText ||
                              pic.caption ||
                              `Uploaded picture ${index + 1}`
                            }
                            fill
                            className="object-cover"
                          />
                          {isCover && (
                            <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded bg-school-green px-2 py-0.5 text-[10px] font-bold text-white shadow">
                              <Star className="h-3 w-3 fill-current" />
                              Cover Image
                            </span>
                          )}
                          {pic.uploadedMediaId && (
                            <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-1 rounded bg-neutral-900/80 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                              Uploaded
                            </span>
                          )}
                        </div>

                        {/* Caption / Alt Text Inputs & Actions */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor={`caption-${pic.id}`}
                              className="text-xs font-semibold text-neutral-700"
                            >
                              Picture {index + 1} Caption
                            </label>
                            <div className="flex items-center gap-2">
                              {!isCover && (
                                <button
                                  type="button"
                                  onClick={() => handleSetAsCover(index)}
                                  className="text-[11px] font-medium text-school-green hover:underline"
                                >
                                  Make Cover
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemovePicture(pic.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>

                          <input
                            id={`caption-${pic.id}`}
                            type="text"
                            value={pic.caption}
                            onChange={(e) =>
                              handleCaptionChange(pic.id, e.target.value)
                            }
                            placeholder="Add a caption for this picture (e.g., Grade 3 students showcasing their science models)..."
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-school-green focus:ring-1 focus:ring-school-green focus:outline-none"
                          />

                          <label
                            htmlFor={`alt-${pic.id}`}
                            className="block text-xs font-semibold text-neutral-700"
                          >
                            Alt text (optional — falls back to caption, then
                            title)
                          </label>
                          <input
                            id={`alt-${pic.id}`}
                            type="text"
                            value={pic.altText}
                            onChange={(e) =>
                              handleAltTextChange(pic.id, e.target.value)
                            }
                            placeholder="Describe this picture for screen readers"
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-school-green focus:ring-1 focus:ring-school-green focus:outline-none"
                          />

                          <p className="text-[10px] text-neutral-400">
                            {pic.file.name} •{" "}
                            {(pic.file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add more button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-school-green hover:underline"
                  >
                    <UploadCloud className="h-4 w-4" />
                    <span>+ Add more photos</span>
                  </button>
                  {fieldErrors.images && (
                    <p className="text-xs font-medium text-red-600">
                      {fieldErrors.images}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            {/* Publishing Action Card */}
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-neutral-900">
                Publishing
              </h2>

              <div className="mt-4 space-y-3 divide-y divide-neutral-100 text-xs text-neutral-600">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-neutral-500">Selected Category:</span>
                  <span className="font-semibold tracking-wide text-neutral-900 uppercase">
                    {category}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 pb-2">
                  <span className="text-neutral-500">Photos Attached:</span>
                  <span className="font-semibold text-neutral-900">
                    {pictures.length}{" "}
                    {pictures.length === 1 ? "photo" : "photos"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-neutral-500">Destination:</span>
                  <span className="font-semibold text-neutral-900">
                    WordPress CMS
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-school-green py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-school-green-dark disabled:opacity-50"
                >
                  {isPending ? (
                    <span>Publishing to Website...</span>
                  ) : (
                    <span>Publish Article</span>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-neutral-900">
                <Info className="h-4 w-4 text-school-green" />
                <h2 className="text-xs font-bold tracking-wider uppercase">
                  Publishing Tips
                </h2>
              </div>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-neutral-600">
                <li>
                  • <strong>Cover Photo:</strong> The first picture will be
                  shown as the main hero thumbnail on the website.
                </li>
                <li>
                  • <strong>Captions:</strong> Adding captions provides context
                  for parents and students viewing the pictures.
                </li>
                <li>
                  • <strong>Categories:</strong> Pick the appropriate category
                  so visitors can easily filter news on the landing page.
                </li>
              </ul>
            </div>
          </div>
        </form>
      ) : (
        /* Tab: Live Article Preview */
        <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-6 flex items-center gap-2">
            <span className="rounded-full bg-school-green/10 px-3 py-1 text-xs font-bold tracking-wider text-school-green uppercase">
              {category}
            </span>
            <span className="text-xs text-neutral-400">• Preview Mode</span>
          </div>

          <h2 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl lg:text-4xl">
            {title || "Untitled Article"}
          </h2>

          <div className="mt-3 text-xs text-neutral-400">
            Published on{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>

          {/* Featured Cover Image if any */}
          {pictures.length > 0 && (
            <figure className="mt-6 overflow-hidden rounded-2xl border border-neutral-200">
              <div className="relative aspect-video w-full">
                <Image
                  src={pictures[0].previewUrl}
                  alt={pictures[0].altText || pictures[0].caption || title}
                  fill
                  className="object-cover"
                />
              </div>
              {pictures[0].caption && (
                <figcaption className="bg-neutral-50 px-4 py-2.5 text-center text-xs text-neutral-600 italic">
                  {pictures[0].caption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Article Body */}
          <div className="mt-8 text-base leading-relaxed whitespace-pre-wrap text-neutral-700">
            {body ||
              "No body content entered yet. Switch back to the Editor tab to write your story."}
          </div>

          {/* Gallery / Additional Photos with Captions */}
          {pictures.length > 1 && (
            <div className="mt-10 border-t border-neutral-100 pt-8">
              <h3 className="text-lg font-bold text-neutral-900">
                Photo Gallery
              </h3>
              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                {pictures.slice(1).map((pic, idx) => (
                  <figure
                    key={pic.id}
                    className="overflow-hidden rounded-xl border border-neutral-200"
                  >
                    <div className="relative aspect-video w-full">
                      <Image
                        src={pic.previewUrl}
                        alt={
                          pic.altText ||
                          pic.caption ||
                          `Gallery photo ${idx + 2}`
                        }
                        fill
                        className="object-cover"
                      />
                    </div>
                    {pic.caption && (
                      <figcaption className="bg-neutral-50 px-3 py-2 text-center text-xs text-neutral-600 italic">
                        {pic.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
