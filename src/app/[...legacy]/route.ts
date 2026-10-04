import { rows } from "@/lib/content/db";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  context: { params: Promise<{ legacy: string[] }> },
) {
  const { legacy } = await context.params;
  const path = "/" + legacy.map(encodeURIComponent).join("/");
  try {
    const [alias] = await rows(
      "SELECT target FROM legacy_urls WHERE path IN (?, ?) LIMIT 1",
      [path, path + "/"],
    );
    if (!alias) return new Response("Not found", { status: 404 });
    if (!alias.target.startsWith("/") || alias.target.startsWith("//"))
      return new Response(null, { status: 404 });
    const target = new URL(alias.target, "https://redirect.invalid");
    if (
      target.origin !== "https://redirect.invalid" ||
      /[\\\x00-\x1f]/.test(alias.target)
    )
      return new Response(null, { status: 404 });
    return new Response(null, {
      status: 301,
      headers: { Location: target.pathname + target.search + target.hash },
    });
  } catch {
    return new Response("Temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
