import {
  LayoutDashboard,
  Home,
  Users,
  GraduationCap,
  Sparkles,
  Images,
  Mail,
  Settings,
  Newspaper,
  FilePlus,
  Award,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

/** Titles for pages that are not sidebar items. */
const EXTRA_PAGE_TITLES: ReadonlyArray<{
  matches: (pathname: string) => boolean;
  title: string;
}> = [
  {
    matches: (p) => /^\/admin\/articles\/[^/]+\/edit$/.test(p),
    title: "Edit Post",
  },
];

export function getAdminPageTitle(pathname: string): string {
  for (const group of ADMIN_NAV_GROUPS) {
    const match = group.items.find((item) => item.href === pathname);
    if (match) return match.label;
  }
  return EXTRA_PAGE_TITLES.find((e) => e.matches(pathname))?.title ?? "Admin";
}

/**
 * The single sidebar item that owns this path: the item with the longest
 * matching href. A plain prefix match would highlight both "All Posts"
 * (/admin/articles) and "Add New" (/admin/articles/new), while editing a
 * post (/admin/articles/12/edit) correctly stays under "All Posts". The
 * query string never matters, so a filtered All Posts is still All Posts.
 */
export function getActiveAdminNavHref(pathname: string): string | null {
  let active: string | null = null;
  for (const group of ADMIN_NAV_GROUPS) {
    for (const { href } of group.items) {
      const matches =
        href === "/admin"
          ? pathname === href
          : pathname === href || pathname.startsWith(href + "/");
      if (matches && (active === null || href.length > active.length))
        active = href;
    }
  }
  return active;
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Website Sections",
    items: [
      { label: "Hero", href: "/admin/sections/hero", icon: Home },
      { label: "About", href: "/admin/sections/about", icon: Users },
      {
        label: "Admission",
        href: "/admin/sections/admission",
        icon: GraduationCap,
      },
      { label: "Clubs", href: "/admin/sections/clubs", icon: Sparkles },
      { label: "Gallery", href: "/admin/sections/gallery", icon: Images },
      { label: "Contact", href: "/admin/sections/contact", icon: Mail },
      {
        label: "School Info",
        href: "/admin/sections/school-info",
        icon: Settings,
      },
      {
        label: "Alumni Achievements",
        href: "/admin/sections/alumni",
        icon: Award,
      },
    ],
  },
  {
    label: "Posts",
    items: [
      { label: "All Posts", href: "/admin/articles", icon: Newspaper },
      { label: "Add New", href: "/admin/articles/new", icon: FilePlus },
    ],
  },
];
