"use client";

import { Menu, LogOut } from "lucide-react";
import { signout } from "@/app/login/actions";

export function TopNav({
  onMenuClick,
  userEmail,
}: {
  onMenuClick: () => void;
  userEmail?: string;
}) {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-ivory-cream bg-ivory-light px-4 shadow-sm sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-text-secondary lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="flex items-center gap-x-4">
            <span className="text-sm font-medium text-text-primary hidden sm:block">
              {userEmail}
            </span>
            <div className="h-8 w-8 rounded-full bg-ivory-cream flex items-center justify-center text-text-primary font-bold">
              {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
            </div>
          </div>
          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-ivory-cream"
            aria-hidden="true"
          />
          <form action={signout}>
            <button
              type="submit"
              className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-error transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
