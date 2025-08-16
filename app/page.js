// page.jsx or page.tsx (not inside "use client" file)
import React, { Suspense } from "react";
import DepartmentPortalLogin from "@/components/main/DashboardLogin";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <DepartmentPortalLogin />
    </Suspense>
  );
}
