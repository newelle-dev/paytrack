"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { cn } from "@/lib/utils";

export function Shell({ children, userEmail }: { children: React.ReactNode; userEmail?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapseMenu, setCollapseMenu] = useState(false);

  return (
    <div className="flex h-screen bg-ivory overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile & Desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar 
          collapseMenu={collapseMenu} 
          setCollapseMenu={setCollapseMenu} 
          onClose={() => setSidebarOpen(false)} 
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopNav onMenuClick={() => setSidebarOpen(true)} userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto bg-ivory p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
