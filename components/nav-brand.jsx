"use client"

import Image from "next/image"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar"

export function NavBrand() {
  const { collapsed } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          className="justify-start px-2 py-2 hover:bg-transparent cursor-default"
          size="lg"
        >
          <Image
            src="/logo.svg" // Change to your actual logo path
            alt="NIT Delhi Logo"
            width={collapsed ? 32 : 40}
            height={collapsed ? 32 : 40}
            className="rounded-md"
          />
          {!collapsed && (
            <span className="ml-2 font-semibold text-lg text-gray-800 dark:text-white">
              Department Portal
            </span>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
