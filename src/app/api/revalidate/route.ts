import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";

import {
  affectedPaths,
  affectedTags,
  revalidationEventSchema,
} from "@/lib/revalidation/event";

function authorized(supplied: string | null): boolean {
  const configured = process.env.REVALIDATION_SECRET;
  if (!configured || !supplied) return false;
  const expected = Buffer.from(configured);
  const actual = Buffer.from(supplied);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function readSmallJson(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 4096) {
      await reader.cancel();
      throw new Error("Oversized body");
    }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export async function POST(request: Request): Promise<Response> {
  if (!authorized(request.headers.get("x-fgs-revalidation-secret"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await readSmallJson(request);
  } catch {
    return Response.json({ error: "Invalid event" }, { status: 400 });
  }
  const parsed = revalidationEventSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid event" }, { status: 400 });
  }

  try {
    for (const tag of affectedTags(parsed.data)) {
      revalidateTag(tag, { expire: 0 });
    }
    for (const path of affectedPaths(parsed.data)) {
      revalidatePath(path, path === "/news/[slug]" ? "page" : undefined);
    }
  } catch {
    return Response.json({ error: "Revalidation failed" }, { status: 503 });
  }
  return Response.json({ revalidated: true });
}
