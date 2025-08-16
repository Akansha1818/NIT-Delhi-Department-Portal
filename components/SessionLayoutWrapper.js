// components/SessionLayoutWrapper.js
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { set } from "mongoose";

export default function SessionLayoutWrapper({ children, session }) {
    const pathname = usePathname();
    const router = useRouter();
    const [department, setDepartment] = useState("");
    const [department1, setDepartment1] = useState("");
    const [department2, setDepartment2] = useState("");

    useEffect(() => {
        if (session?.user?.email) {
            setDepartment(session.user.department);
            if (session.user.department === "CSE") {
                setDepartment1("Department of Computer Science and Engineering");
                setDepartment2("Dept. of CSE");
            } else if (session.user.department === "ECE") {
                setDepartment1("Department of Electronics and Communication Engineering");
                setDepartment2("Dept. of ECE");
            } else if (session.user.department === "ME") {
                setDepartment1("Department of Mechanical Engineering");
                setDepartment2("Dept. of ME");
            } else if (session.user.department === "CE") {
                setDepartment1("Department of Civil Engineering");
                setDepartment2("Dept. of CE");
            } else if (session.user.department === "EE") {
                setDepartment1("Department of Electrical Engineering");
                setDepartment2("Dept. of EE");
            } else {
                setDepartment1("Department of " + session.user.name);
                setDepartment2("Dept. of " + session.user.department);
            }
        }
    }, [session]);

    const pageTitleMap = {
        "/department_portal/programs": "Programs",
        "/department_portal/laboratories": "Laboratories",
        "/department_portal/faculty": "Faculty",
        "/department_portal/staff": "Staff",
        "/department_portal/events": "Events",
        "/department_portal/about": "About",
        "/department_portal/banners": "Banners",
        "/department_portal/gallery": "Gallery",
        "/department_portal/RnD": "Research and Development",
    };

    const currentPage = pageTitleMap[pathname] || "Dashboard";

    return (
        <SidebarProvider>
            <Toaster richColors position="top-right" closeButton />
            <AppSidebar session={session} />
            <SidebarInset>
                <div className="sticky top-0 z-50 bg-white">
                    <header className="flex h-20 md:h-24 items-center gap-2">
                        <div className="flex items-center gap-4 px-4 w-full overflow-hidden">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4 bg-gray-300"
                            />
                            <div className="flex flex-col truncate w-full leading-tight">
                                <h1 className="font-semibold text-[#212178] dark:text-white truncate sm:text-sm md:text-xl">
                                    <span className="hidden md:inline">
                                        {department1}
                                    </span>
                                    <span className="inline md:hidden">{department2}</span>
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 truncate sm:text-xs md:text-sm lg:text-base">
                                    National Institute of Technology Delhi
                                </p>
                            </div>
                        </div>
                    </header>
                    <div className="h-px w-[98%] bg-gray-300 mx-auto" />
                    <div className="px-4 p-2">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/department_portal">Department Portal</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-[#212178]">{currentPage}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </div>

                <div className="flex flex-1 flex-col px-4 p-2 gap-4">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
}
