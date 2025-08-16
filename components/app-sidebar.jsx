"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main2"
import { NavUser } from "@/components/nav-user"
import { NavBrand } from "@/components/nav-brand"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ session, ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex h-20 md:h-24 items-center justify-center">
        <NavBrand />
      </SidebarHeader>

      {/* Horizontal separator */}
      <div className="h-px w-[95%] bg-gray-300 mx-auto" />

      <SidebarContent>
        <NavMain />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: session?.user?.name,
            email: session?.user?.email,
            avatar: session?.user?.image,
          }}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
