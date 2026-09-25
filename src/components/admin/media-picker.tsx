"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Search,
  UploadCloud,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  MediaLibraryItem,
  MediaLibraryListResult,
} from "@/lib/wordpress/media-library";

import { listMediaAction } from "@/app/admin/(protected)/media-actions";

export interface MediaPickerSelection {
  mediaId: number;
  url: string;
  alt: string;
}

export function MediaPickerDialog({
  trigger,
  title = "Choose a photo",
  allowMultipleUpload = false,
  onSelectExisting,
  onSelectFiles,
}: {
  trigger: React.ReactNode;
  title?: string;
  /** Whether the Upload tab's file input accepts more than one file at once. */
  allowMultipleUpload?: boolean;
  /** An existing library item was picked — no upload happens. */
  onSelectExisting: (item: MediaPickerSelection) => void;
  /** One or more new files were chosen on the Upload tab — not yet uploaded. */
  onSelectFiles: (files: File[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [result, setResult] = useState<MediaLibraryListResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setTab("library");
      setSearchInput("");
      setSearch("");
      setPage(1);
      setResult(null);
    }
  };

  useEffect(() => {
    if (!open || tab !== "library") return;
    let cancelled = false;
    // Fetching-in-an-effect's canonical "start loading" flag — the fetch
    // itself is async and only resolves state in its .then() callback.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    listMediaAction({ search, page }).then((next) => {
      if (cancelled) return;
      setResult(next);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, tab, search, page, reloadNonce]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handlePick = (item: MediaLibraryItem) => {
    onSelectExisting({ mediaId: item.id, url: item.url, alt: item.alt });
    setOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    onSelectFiles(Array.from(files));
    e.target.value = "";
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Reuse a photo already in the WordPress media library, or upload a
            new one.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "library" | "upload")}
        >
          <TabsList>
            <TabsTrigger value="library">Choose from library</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-4">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search media..."
                  aria-label="Search media library"
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50/50 py-2 pr-3 pl-9 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-school-green focus:bg-white focus:ring-2 focus:ring-school-green/20 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-neutral-900 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
              >
                Search
              </button>
            </form>

            <div className="mt-4 min-h-[16rem]">
              {loading ? (
                <div className="flex h-64 items-center justify-center text-sm text-neutral-400">
                  Loading media…
                </div>
              ) : !result || result.status === "unavailable" ? (
                <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
                  <AlertCircle className="h-6 w-6 text-neutral-300" />
                  <p className="text-sm text-neutral-500">
                    Couldn&apos;t load the media library.
                  </p>
                  <button
                    type="button"
                    onClick={() => setReloadNonce((n) => n + 1)}
                    className="text-xs font-semibold text-school-green hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : result.items.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center gap-1 text-center">
                  <ImageOff className="h-6 w-6 text-neutral-300" />
                  <p className="text-sm font-semibold text-neutral-700">
                    {search
                      ? "No matching photos found."
                      : "The media library is empty."}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {search
                      ? "Try a different search, or upload a new photo."
                      : "Upload a photo to get started."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {result.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handlePick(item)}
                        className="group rounded-lg border border-neutral-200 p-1.5 text-left transition-colors hover:border-school-green focus-visible:border-school-green focus-visible:ring-2 focus-visible:ring-school-green/30 focus-visible:outline-none"
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-neutral-100">
                          <Image
                            src={item.url}
                            alt={item.alt || "Untitled media"}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <p className="mt-1.5 truncate text-[11px] text-neutral-500">
                          {item.alt || "No alt text"}
                        </p>
                      </button>
                    ))}
                  </div>

                  {result.totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        aria-label="Previous page"
                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        <span>Previous</span>
                      </button>
                      <span>
                        Page {page} of {result.totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPage((p) => Math.min(result.totalPages, p + 1))
                        }
                        disabled={page >= result.totalPages}
                        aria-label="Next page"
                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 p-10 text-center transition-colors hover:border-school-green hover:bg-neutral-50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-school-green-light text-school-green">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-neutral-800">
                {allowMultipleUpload
                  ? "Click to select one or more pictures"
                  : "Click to select a picture"}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                PNG, JPG, WebP, or AVIF (up to 10MB per image)
              </p>
              <input
                type="file"
                multiple={allowMultipleUpload}
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
