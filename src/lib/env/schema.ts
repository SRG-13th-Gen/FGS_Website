import { z } from "zod";
import { isAbsolute } from "node:path";
const optional = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.string().optional(),
);
const schema = z.object({
  DB_HOST: optional,
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_NAME: optional,
  DB_USER: optional,
  DB_PASSWORD: optional,
  MEDIA_STORAGE_PATH: optional,
});
export function parseServerEnvironment(
  source: Record<string, string | undefined>,
) {
  const parsed = schema.safeParse(source);
  if (!parsed.success)
    throw new Error(
      "Invalid server environment: " +
        [...new Set(parsed.error.issues.map((i) => i.path[0]))].join(", "),
    );
  if (
    source.NODE_ENV === "production" &&
    parsed.data.MEDIA_STORAGE_PATH &&
    !isAbsolute(parsed.data.MEDIA_STORAGE_PATH)
  )
    throw new Error("MEDIA_STORAGE_PATH must be absolute in production.");
  return parsed.data;
}
