"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const links = [
    { href: "/", label: t.home, icon: "home" },
    { href: "/explore", label: t.explore, icon: "travel_explore" },
    { href: "/add-inspiration", label: t.addInspiration, icon: "add_circle" },
    { href: "/bucket-list", label: t.bucketList, icon: "bookmark_heart" },
    { href: "/trips", label: t.trips, icon: "map" },
    { href: "/profile", label: t.profile, icon: "person" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-surface-container-low z-50 flex flex-col py-margin-desktop border-r border-outline-variant/30">
      <div className="px-8 mb-12 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl">
          <span className="material-symbols-outlined text-on-primary">explore</span>
        </div>
        <span className="font-display-md text-headline-md tracking-tight text-primary">Roamly</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-primary-container text-on-primary-container shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined mr-4 group-hover:scale-110 transition-transform">
                {link.icon}
              </span>
              <span className="font-label-lg">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
