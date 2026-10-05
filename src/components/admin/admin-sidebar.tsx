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

import { ADMIN_NAV_GROUPS, getActiveAdminNavHref } from "./admin-nav";

export function AdminSidebar() {
  const activeHref = getActiveAdminNavHref(usePathname());

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
                  const active = item.href === activeHref;
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
          Saved changes appear on the live site.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
