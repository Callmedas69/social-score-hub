"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Activity, Compass } from "lucide-react";
import { BaseIcon } from "@/components/icons/BaseIcon";

const navItems = [
  { href: "/score", label: "Score", icon: Sparkles },
  { href: "/stats", label: "Stats", icon: Activity },
  { href: "/checkin", label: "Hello", icon: BaseIcon },
  { href: "/ecosystem", label: "Ecosystem", icon: Compass },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors
                ${isActive
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
