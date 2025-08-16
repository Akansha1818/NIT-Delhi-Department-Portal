import React, { Suspense } from "react";
import DepartmentPortalLogin from "@/components/main/DashboardLogin";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <DepartmentPortalLogin />
    </Suspense>
  );
}
