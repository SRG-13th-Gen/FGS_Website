"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { trashArticleAction } from "./actions";

export function TrashArticleButton({
  id,
  title,
  articlePath,
}: {
  id: number;
  title: string;
  articlePath: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await trashArticleAction(id, articlePath);
      if (result.status === "success") {
        toast.success(
          result.cacheWarning
            ? "Moved to trash — the site may take a few minutes to update."
            : "Article moved to trash.",
        );
        setOpen(false);
        router.refresh();
      } else if (result.status === "not-found") {
        toast.error("This article was already removed.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          aria-label={`Move "${title}" to trash`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Trash</span>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Move &quot;{title}&quot; to trash?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This article will disappear from the website. It stays in
            WordPress&apos;s trash and is never permanently deleted — restore it
            from wp-admin if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isPending ? "Moving..." : "Move to Trash"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
