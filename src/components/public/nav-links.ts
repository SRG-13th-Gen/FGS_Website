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
