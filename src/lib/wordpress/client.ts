import "server-only";

import { getServerEnvironment } from "@/lib/env/server";

// Every request resolves against this fixed, server-configured base — never
// a client-supplied URL (docs/DATA_API_CONTRACTS.md).
export function getWordpressBaseUrl(): string {
  return getServerEnvironment().WORDPRESS_URL.replace(/\/+$/, "");
}

export class WordpressConfigError extends Error {}

function getAuthHeader(): string {
  const env = getServerEnvironment();
  if (!env.WORDPRESS_USERNAME || !env.WORDPRESS_APPLICATION_PASSWORD) {
    throw new WordpressConfigError(
      "WordPress integration account is not configured.",
    );
  }
  const token = Buffer.from(
    `${env.WORDPRESS_USERNAME}:${env.WORDPRESS_APPLICATION_PASSWORD}`,
  ).toString("base64");
  return `Basic ${token}`;
}

/** Public, unauthenticated reads. Cached and revalidated per Next.js `fetch` options. */
export function wordpressPublicFetch(
  path: string,
  options: { revalidate: number; tags: string[] },
): Promise<Response> {
  return fetch(`${getWordpressBaseUrl()}/wp-json/wp/v2${path}`, {
    next: { revalidate: options.revalidate, tags: options.tags },
  });
}

/** Privileged, authenticated writes/reads. Never cached. */
export function wordpressAuthedFetch(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs, ...rest } = init;
  const headers = new Headers(rest.headers);
  headers.set("Authorization", getAuthHeader());

  const controller = new AbortController();
  const timer = timeoutMs
    ? setTimeout(() => controller.abort(), timeoutMs)
    : null;

  return fetch(`${getWordpressBaseUrl()}/wp-json/wp/v2${path}`, {
    ...rest,
    headers,
    cache: "no-store",
    signal: controller.signal,
  }).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}
