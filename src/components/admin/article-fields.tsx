"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Star,
  Megaphone,
  Calendar,
  Sparkles,
  RefreshCw,
} from "lucide-react";

import type { ArticleCategorySlug } from "@/lib/wordpress/types";

export const ARTICLE_CATEGORY_OPTIONS: Array<{
  id: ArticleCategorySlug;
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

export function ArticleCategoryPicker({
  value,
  onChange,
  error,
}: {
  value: ArticleCategorySlug;
  onChange: (next: ArticleCategorySlug) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-neutral-800">
        Category <span className="text-red-500">*</span>
      </label>
      <p className="mt-1 text-xs text-neutral-500">
        Select where this article will be published on the website.
      </p>

      <div className="mt-3.5 grid gap-3 sm:grid-cols-3">
        {ARTICLE_CATEGORY_OPTIONS.map((cat) => {
          const Icon = cat.icon;
          const isSelected = value === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
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
      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}

export interface ArticlePicture {
  id: string;
  /** null for an existing, unmodified photo — reused via existingMediaId, never re-uploaded. */
  file: File | null;
  previewUrl: string;
  caption: string;
  altText: string;
  /** Set for an existing photo, or once a new upload has succeeded (so a retry reuses it). */
  existingMediaId: number | null;
}

export function newArticlePicture(file: File): ArticlePicture {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    caption: "",
    altText: "",
    existingMediaId: null,
  };
}

/** Programmatically attaches `file` to a hidden file input via DataTransfer, so it rides along with native form submission. */
export function PictureFileField({ name, file }: { name: string; file: File }) {
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
      name={name}
      className="hidden"
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}

/** The hidden inputs a save/publish server action's parseImages() reads — shared by New Article and Edit Article. */
export function ArticlePictureFormFields({
  pictures,
}: {
  pictures: ArticlePicture[];
}) {
  return (
    <>
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
          {pic.existingMediaId ? (
            <input
              type="hidden"
              name={`image-existingId-${pic.id}`}
              value={pic.existingMediaId}
              readOnly
            />
          ) : (
            pic.file && (
              <PictureFileField name={`image-file-${pic.id}`} file={pic.file} />
            )
          )}
        </div>
      ))}
    </>
  );
}

export function ArticlePictureEditor({
  pictures,
  onChange,
  error,
}: {
  pictures: ArticlePicture[];
  onChange: (next: ArticlePicture[]) => void;
  error?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetId = useRef<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    onChange([...pictures, ...Array.from(files).map(newArticlePicture)]);
    e.target.value = "";
  };

  const handleReplaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = replaceTargetId.current;
    e.target.value = "";
    if (!file || !targetId) return;
    onChange(
      pictures.map((pic) =>
        pic.id === targetId
          ? {
              ...pic,
              file,
              previewUrl: URL.createObjectURL(file),
              existingMediaId: null,
            }
          : pic,
      ),
    );
  };

  const handleReplaceClick = (id: string) => {
    replaceTargetId.current = id;
    replaceInputRef.current?.click();
  };

  const update = (id: string, patch: Partial<ArticlePicture>) => {
    onChange(
      pictures.map((pic) => (pic.id === id ? { ...pic, ...patch } : pic)),
    );
  };

  const remove = (id: string) => {
    onChange(pictures.filter((pic) => pic.id !== id));
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    const copy = [...pictures];
    const [item] = copy.splice(index, 1);
    copy.unshift(item);
    onChange(copy);
  };

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-neutral-800">
            Article Pictures &amp; Captions
          </h2>
          <p className="text-xs text-neutral-500">
            Upload photos for your article. Each photo can have its own custom
            caption and alt text.
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

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/avif"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        onChange={handleReplaceChange}
        className="hidden"
      />

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
        <div className="mt-5 space-y-4">
          {pictures.map((pic, index) => {
            const isCover = index === 0;
            return (
              <div
                key={pic.id}
                className="flex flex-col gap-4 rounded-xl border border-neutral-200/90 bg-neutral-50/50 p-4 sm:flex-row sm:items-start"
              >
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:h-28 sm:w-36">
                  <Image
                    src={pic.previewUrl}
                    alt={pic.altText || pic.caption || `Picture ${index + 1}`}
                    fill
                    unoptimized={pic.previewUrl.startsWith("blob:")}
                    className="object-cover"
                  />
                  {isCover && (
                    <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded bg-school-green px-2 py-0.5 text-[10px] font-bold text-white shadow">
                      <Star className="h-3 w-3 fill-current" />
                      Cover Image
                    </span>
                  )}
                  {pic.existingMediaId && !pic.file && (
                    <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-1 rounded bg-neutral-900/80 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                      Existing
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={`caption-${pic.id}`}
                      className="text-xs font-semibold text-neutral-700"
                    >
                      Picture {index + 1} Caption
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleReplaceClick(pic.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-neutral-900"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Replace</span>
                      </button>
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => setAsCover(index)}
                          className="text-[11px] font-medium text-school-green hover:underline"
                        >
                          Make Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(pic.id)}
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
                      update(pic.id, { caption: e.target.value })
                    }
                    placeholder="Add a caption for this picture..."
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-school-green focus:ring-1 focus:ring-school-green focus:outline-none"
                  />

                  <label
                    htmlFor={`alt-${pic.id}`}
                    className="block text-xs font-semibold text-neutral-700"
                  >
                    Alt text (optional — falls back to caption, then title)
                  </label>
                  <input
                    id={`alt-${pic.id}`}
                    type="text"
                    value={pic.altText}
                    onChange={(e) =>
                      update(pic.id, { altText: e.target.value })
                    }
                    placeholder="Describe this picture for screen readers"
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-school-green focus:ring-1 focus:ring-school-green focus:outline-none"
                  />

                  {pic.file && (
                    <p className="text-[10px] text-neutral-400">
                      {pic.file.name} •{" "}
                      {(pic.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 text-xs font-semibold text-school-green hover:underline"
          >
            <UploadCloud className="h-4 w-4" />
            <span>+ Add more photos</span>
          </button>
        </div>
      )}
      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
