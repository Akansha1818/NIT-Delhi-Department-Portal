"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
    LayoutDashboard,
    Users,
    BookOpen,
    Microscope,
    Image as GalleryIcon,
    Settings,
    BadgeHelp,
    Network,
    Calendar,
    FolderOpenDot,
} from "lucide-react";

export function NavMain() {
    const pathname = usePathname(); // 🔍 get current route

    const navItems = [
        { title: "Dashboard", icon: LayoutDashboard, href: "/department_portal" },
        { title: "About Us", icon: BadgeHelp, href: "/department_portal/about" },
        // { title: "Faculty", icon: Users, href: "/department_portal/faculty" },
        { title: "Staff", icon: Settings, href: "/department_portal/staff" },
        { title: "Research & Development", icon: Microscope, href: "/department_portal/RnD" },
        { title: "Programs", icon: BookOpen, href: "/department_portal/programs" },
        { title: "Laboratories", icon: Network, href: "/department_portal/laboratories" },
        { title: "Events", icon: Calendar, href: "/department_portal/events" },
        { title: "Gallery", icon: GalleryIcon, href: "/department_portal/gallery" },
        { title: "Banners", icon: FolderOpenDot, href: "/department_portal/banners" },
    ];

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu className="flex flex-col gap-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                className={`w-full p-4.5 gap-2 rounded text-sm lg:text-base
                                    ${isActive
                                        ? "bg-[#212178] text-white hover:bg-[#212178] hover:text-white"
                                        : "hover:bg-primary/10 hover:text-primary transition-colors"}`}
                            >
                                <Link href={item.href} className="flex items-center w-full">
                                    <item.icon className="w-6 h-6 lg:w-7 lg:h-7 transition-transform duration-150" />
                                    <span className="truncate ml-2">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
