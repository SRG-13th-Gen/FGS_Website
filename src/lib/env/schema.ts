import { z } from "zod";

const optionalSecret = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().optional(),
);

const environmentSchema = z.object({
  WORDPRESS_URL: z.url().refine((value) => {
    if (!URL.canParse(value)) return false;
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    );
  }),
  WORDPRESS_USERNAME: optionalSecret,
  WORDPRESS_APPLICATION_PASSWORD: optionalSecret,
  REVALIDATION_SECRET: optionalSecret,
});

export function parseServerEnvironment(
  source: Record<string, string | undefined>,
) {
  const result = environmentSchema.safeParse({
    ...source,
    WORDPRESS_URL:
      source.WORDPRESS_URL ??
      (source.NODE_ENV === "production" ? undefined : "http://localhost:8080"),
  });

  if (!result.success) {
    const fields = [
      ...new Set(result.error.issues.map((issue) => issue.path[0])),
    ];
    // Never include rejected values: URLs and credentials can contain secrets.
    throw new Error(`Invalid server environment: ${fields.join(", ")}`);
  }

  if (
    source.NODE_ENV === "production" &&
    new URL(result.data.WORDPRESS_URL).protocol !== "https:"
  ) {
    throw new Error("WORDPRESS_URL must use HTTPS in production.");
  }

  return result.data;
}
