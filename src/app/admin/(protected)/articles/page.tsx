import Link from "next/link";
import { Construction } from "lucide-react";

export default function AdminAllArticlesPage() {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
      <Construction className="mx-auto h-8 w-8 text-neutral-400" />
      <h2 className="mt-3 text-base font-semibold text-neutral-900">
        All Articles list is not built yet
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
        Listing, searching, editing, and trashing existing articles is scheduled
        for a later work step. You can still publish new articles now.
      </p>
      <Link
        href="/admin/articles/new"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-school-green hover:underline"
      >
        New Article
      </Link>
    </div>
  );
}
