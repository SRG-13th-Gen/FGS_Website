"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { ADMIN_NAV_GROUPS } from "./admin-nav";

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 px-2 py-1.5 transition-opacity hover:opacity-90"
        >
          <Image
            src="/images/logo/fgs-logo-website-1.webp"
            alt="Flor de Grace School"
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 object-contain"
            priority
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">
              Flor de Grace School
            </span>
            <span className="text-xs text-muted-foreground">Admin CMS</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {ADMIN_NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className="data-[active=true]:bg-school-green-light data-[active=true]:font-semibold data-[active=true]:text-school-green-dark"
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <p className="px-2 py-1.5 text-xs text-muted-foreground">
          Changes publish to the live site within a few minutes.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
