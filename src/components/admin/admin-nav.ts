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

export function getAdminPageTitle(pathname: string): string {
  for (const group of ADMIN_NAV_GROUPS) {
    const match = group.items.find((item) => item.href === pathname);
    if (match) return match.label;
  }
  if (pathname.startsWith("/admin/articles/") && pathname.endsWith("/edit")) {
    return "Edit News & Events";
  }
  return "Admin";
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
    ],
  },
  {
    label: "News & Events",
    items: [
      { label: "All News", href: "/admin/articles", icon: Newspaper },
      { label: "Add New", href: "/admin/articles/new", icon: FilePlus },
    ],
  },
];
