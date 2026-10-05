/** Section links point at the homepage so they work from every route. */
export function sectionHref(id: string): string {
  return `/#${id}`;
}

/** The element id a section link (`/#about`) targets. */
export function sectionId(href: string): string {
  return href.slice(href.indexOf("#") + 1);
}

/** In-page smooth scrolling and section highlighting only apply on the homepage. */
export function isHomepage(pathname: string | null): boolean {
  return pathname === "/";
}

export interface NavItem {
  label: string;
  href: string;
  /** "anchor" scrolls to a homepage section, "route" is its own page. */
  kind: "anchor" | "route";
}

/** Public navigation, in display order. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Home", href: sectionHref("home"), kind: "anchor" },
  { label: "About Us", href: sectionHref("about"), kind: "anchor" },
  { label: "Admission", href: sectionHref("admission"), kind: "anchor" },
  { label: "News & Events", href: sectionHref("news"), kind: "anchor" },
  { label: "PTA", href: "/pta", kind: "route" },
  { label: "Alumni", href: "/alumni", kind: "route" },
  { label: "Clubs", href: sectionHref("clubs"), kind: "anchor" },
  { label: "Gallery", href: sectionHref("gallery"), kind: "anchor" },
  { label: "Contact Us", href: sectionHref("contact"), kind: "anchor" },
];

/**
 * The href of the item that is current, or null. On the homepage it is the
 * section in view; on a route page it is that route's tab. Anywhere else
 * (an article, for example) nothing is current, since no tab links to it.
 */
export function getCurrentNavHref(
  pathname: string | null,
  sectionInView: string,
): string | null {
  if (isHomepage(pathname)) return sectionInView;
  const route = NAV_ITEMS.find(
    (item) =>
      item.kind === "route" &&
      pathname !== null &&
      (pathname === item.href || pathname.startsWith(item.href + "/")),
  );
  return route?.href ?? null;
}

/** `page` for the current route tab, `location` for the section in view. */
export function getAriaCurrent(
  item: NavItem,
  currentHref: string | null,
): "page" | "location" | undefined {
  if (item.href !== currentHref) return undefined;
  return item.kind === "route" ? "page" : "location";
}
