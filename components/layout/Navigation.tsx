"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Activity, Compass } from "lucide-react";
import { BaseIcon } from "@/components/icons/BaseIcon";
import { sdk } from "@farcaster/miniapp-sdk";

const navItems = [
  { href: "/score", label: "Score", icon: Sparkles, primary: false },
  { href: "/stats", label: "Stats", icon: Activity, primary: false },
  { href: "/checkin", label: "Hello", icon: BaseIcon, primary: true },
  { href: "/ecosystem", label: "Eco", icon: Compass, primary: false },
];

export function Navigation() {
  const pathname = usePathname();

  const handleNavClick = () => {
    try {
      sdk.haptics.selectionChanged();
    } catch {
      // Silently fail if not in Farcaster context
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, label, icon: Icon, primary }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              className={`flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95
                ${isActive
                  ? "text-gray-900 bg-gray-100"
                  : primary
                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
