"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Borrowers", href: "/borrowers", icon: Users },
  { name: "Loans", href: "/loans", icon: CreditCard },
];

export function Sidebar({
  collapseMenu,
  setCollapseMenu,
  onClose,
}: {
  collapseMenu: boolean;
  setCollapseMenu: (v: boolean) => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex flex-col border-r border-ivory-cream bg-ivory-light transition-all duration-300 h-full",
        collapseMenu ? "w-20" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-ivory-cream shrink-0">
        {!collapseMenu && (
          <span className="text-xl font-bold text-text-primary">PayTrack</span>
        )}

        {/* Desktop toggle */}
        <button
          onClick={() => setCollapseMenu(!collapseMenu)}
          className={cn(
            "p-2 text-text-secondary hover:bg-ivory hover:text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-gold",
            "hidden lg:block",
          )}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Mobile close */}
        <button
          onClick={onClose}
          className={cn(
            "p-2 text-text-secondary hover:bg-ivory hover:text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-gold",
            "lg:hidden",
          )}
          aria-label="Close sidebar"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                if (onClose) onClose();
              }}
              className={cn(
                "group flex items-center rounded-md px-2 py-2 text-sm font-medium",
                isActive
                  ? "bg-gold text-white"
                  : "text-text-secondary hover:bg-ivory hover:text-text-primary",
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 shrink-0",
                  collapseMenu ? "mx-auto" : "mr-3",
                  isActive
                    ? "text-white"
                    : "text-text-secondary group-hover:text-text-primary",
                )}
                aria-hidden="true"
              />
              {!collapseMenu && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
