import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-6 px-6 py-16"
    >
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground">
        This page is not available. You can return to the home page.
      </p>
      <Button asChild size="lg" className="min-h-11 w-fit px-5">
        <Link href="/">Return home</Link>
      </Button>
    </main>
  );
}
