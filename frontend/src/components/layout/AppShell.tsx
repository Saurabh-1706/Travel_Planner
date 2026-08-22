"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

// Routes that render as standalone pages — no sidebar, no header,
// none of the app's dashboard chrome. Just the page itself.
const STANDALONE_ROUTES = ["/login", "/register", "/forgot-password"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isStandalone) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <div className="pl-[280px]">
        <Header />
        <main className="relative pt-20 min-h-screen">{children}</main>
      </div>
    </>
  );
}
