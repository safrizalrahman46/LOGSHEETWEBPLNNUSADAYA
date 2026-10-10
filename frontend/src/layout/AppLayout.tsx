"use client";

import React from "react";
import { useSidebar } from "@/context/SidebarContext";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { AppFooter } from "./AppFooter";
import Backdrop from "./Backdrop";
import { cn } from "@/utils";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Sidebar permanen mulai breakpoint lg (1024px);
  // Di bawah lg sidebar berupa drawer overlay dengan backdrop.
  const mainContentMargin =
    isExpanded || isHovered ? "lg:ml-[280px]" : "lg:ml-[90px]";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-200 dark:bg-gray-950 dark:text-gray-100 overflow-x-hidden">
      <AppSidebar />
      <Backdrop />
      <div
        className={cn(
          "flex min-h-screen min-w-0 max-w-full flex-col transition-all duration-300 ease-in-out",
          mainContentMargin
        )}
      >
        <AppHeader />
        <main className="flex-1 min-w-0 max-w-full p-3 sm:p-5 lg:p-6 xl:p-8 overflow-x-hidden">
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  );
};

export default AppLayout;
