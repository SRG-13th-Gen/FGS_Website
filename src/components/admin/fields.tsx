"use client";

import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Plus, Trash2, UploadCloud } from "lucide-react";

import { MediaPickerDialog } from "@/components/admin/media-picker";
import { reorderArray } from "@/lib/wordpress/sections/reorder";
import {
  SECTION_ICON_NAMES,
  SECTION_ICON_OPTIONS,
  type SectionIconName,
} from "@/lib/wordpress/sections/icons";

const fieldLabelClass = "block text-sm font-bold text-neutral-800";
const helperTextClass = "mt-1 text-xs text-neutral-500";
const errorTextClass = "mt-1.5 text-xs font-medium text-red-600";
const inputClass =
  "mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-school-green focus:bg-white focus:ring-2 focus:ring-school-green/20 focus:outline-none";

export function TextField({
  id,
  label,
  helperText,
  error,
  ...props
}: {
  id: string;
  label: string;
  helperText?: string;
  error?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id">) {
  return (
    <div>
      <label htmlFor={id} className={fieldLabelClass}>
        {label}
      </label>
      {helperText && <p className={helperTextClass}>{helperText}</p>}
      <input
        id={id}
        className={inputClass}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className={errorTextClass}>
          {error}
        </p>
      )}
    </div>
  );
}

export function TextareaField({
  id,
  label,
  helperText,
  error,
  rows = 4,
  ...props
}: {
  id: string;
  label: string;
  helperText?: string;
  error?: string;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id">) {
  return (
    <div>
      <label htmlFor={id} className={fieldLabelClass}>
        {label}
      </label>
      {helperText && <p className={helperTextClass}>{helperText}</p>}
      <textarea
        id={id}
        rows={rows}
        className={`${inputClass} leading-relaxed`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className={errorTextClass}>
          {error}
        </p>
      )}
    </div>
  );
}

export interface ImageFieldValue {
  mediaId: number;
  previewUrl: string;
  alt: string;
  /** Set while a newly selected file hasn't been uploaded/saved yet. */
  pendingFile: File | null;
}

export function ImageField({
  label,
  helperText,
  recommendedSize,
  value,
  onChange,
  error,
}: {
  label: string;
  helperText?: string;
  recommendedSize?: string;
  value: ImageFieldValue;
  onChange: (next: ImageFieldValue) => void;
  error?: string;
}) {
  const inputId = useId();

  return (
    <div>
      <span className={fieldLabelClass}>{label}</span>
      {helperText && <p className={helperTextClass}>{helperText}</p>}

      <div className="mt-2.5 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 sm:w-48">
          {value.previewUrl ? (
            <Image
              src={value.previewUrl}
              alt={value.alt || label}
              fill
              unoptimized={value.previewUrl.startsWith("blob:")}
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
              No image
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2.5">
          <MediaPickerDialog
            title={`Choose a photo — ${label}`}
            onSelectExisting={(item) =>
              onChange({
                ...value,
                mediaId: item.mediaId,
                previewUrl: item.url,
                pendingFile: null,
              })
            }
            onSelectFiles={(files) => {
              const file = files[0];
              if (!file) return;
              onChange({
                ...value,
                previewUrl: URL.createObjectURL(file),
                pendingFile: file,
              });
            }}
            trigger={
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Replace image</span>
              </button>
            }
          />
          {recommendedSize && (
            <p className="text-xs text-neutral-400">
              Recommended size: {recommendedSize}
            </p>
          )}

          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-neutral-700"
          >
            Alt text
          </label>
          <input
            id={inputId}
            type="text"
            value={value.alt}
            onChange={(e) => onChange({ ...value, alt: e.target.value })}
            placeholder="Describe this image for screen readers"
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-school-green focus:ring-1 focus:ring-school-green focus:outline-none"
          />
        </div>
      </div>
      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}

export function StringListField({
  label,
  helperText,
  values,
  onChange,
  itemLabel = "Item",
  error,
}: {
  label: string;
  helperText?: string;
  values: string[];
  onChange: (next: string[]) => void;
  itemLabel?: string;
  error?: string;
}) {
  const update = (index: number, value: string) => {
    onChange(values.map((v, i) => (i === index ? value : v)));
  };
  const remove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };
  const move = (index: number, direction: -1 | 1) => {
    onChange(reorderArray(values, index, direction));
  };
  const add = () => onChange([...values, ""]);

  return (
    <div>
      <span className={fieldLabelClass}>{label}</span>
      {helperText && <p className={helperTextClass}>{helperText}</p>}

      <div className="mt-2.5 space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => update(index, e.target.value)}
              aria-label={`${itemLabel} ${index + 1}`}
              className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-school-green focus:ring-1 focus:ring-school-green focus:outline-none"
            />
            <button
              type="button"
              onClick={() => move(index, -1)}
              disabled={index === 0}
              aria-label={`Move ${itemLabel} ${index + 1} up`}
              className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              disabled={index === values.length - 1}
              aria-label={`Move ${itemLabel} ${index + 1} down`}
              className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={`Remove ${itemLabel} ${index + 1}`}
              className="rounded-lg border border-neutral-200 p-1.5 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-school-green hover:underline"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add {itemLabel.toLowerCase()}</span>
      </button>
      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}

export function IconPickerField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: SectionIconName;
  onChange: (next: SectionIconName) => void;
  error?: string;
}) {
  return (
    <div>
      <span className={fieldLabelClass}>{label}</span>
      <div
        className="mt-2 flex flex-wrap gap-2"
        role="radiogroup"
        aria-label={label}
      >
        {SECTION_ICON_NAMES.map((name) => {
          const Icon = SECTION_ICON_OPTIONS[name];
          const selected = value === name;
          return (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={name}
              onClick={() => onChange(name)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                selected
                  ? "border-school-green bg-school-green-light text-school-green"
                  : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}

export function RepeatableList<T>({
  label,
  helperText,
  items,
  onChange,
  itemLabel,
  createItem,
  renderItem,
  error,
  minItems = 0,
  maxItems,
}: {
  label: string;
  helperText?: string;
  items: T[];
  onChange: (next: T[]) => void;
  itemLabel: string;
  createItem: () => T;
  renderItem: (
    item: T,
    update: (patch: Partial<T>) => void,
    index: number,
  ) => React.ReactNode;
  error?: string;
  minItems?: number;
  maxItems?: number;
}) {
  const update = (index: number, patch: Partial<T>) => {
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };
  const remove = (index: number) =>
    onChange(items.filter((_, i) => i !== index));
  const move = (index: number, direction: -1 | 1) =>
    onChange(reorderArray(items, index, direction));
  const add = () => onChange([...items, createItem()]);
  const canAdd = maxItems === undefined || items.length < maxItems;
  const canRemove = items.length > minItems;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className={fieldLabelClass}>{label}</span>
        {canAdd && (
          <button
            type="button"
            onClick={add}
            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-school-green hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add {itemLabel.toLowerCase()}</span>
          </button>
        )}
      </div>
      {helperText && <p className={helperTextClass}>{helperText}</p>}

      <div className="mt-3 space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500">
                {itemLabel} {index + 1}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${itemLabel} ${index + 1} up`}
                  className="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Move ${itemLabel} ${index + 1} down`}
                  className="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={!canRemove}
                  aria-label={`Remove ${itemLabel} ${index + 1}`}
                  className="rounded-lg border border-neutral-200 bg-white p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {renderItem(item, (patch) => update(index, patch), index)}
          </div>
        ))}
      </div>
      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}

/** Programmatically attaches `file` to a hidden file input via DataTransfer, so it rides along with native form submission. */
export function HiddenFileField({ name, file }: { name: string; file: File }) {
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
