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

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "xl:ml-[290px]"
    : "xl:ml-[90px]";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-200 dark:bg-gray-950 dark:text-gray-100">
      <AppSidebar />
      <Backdrop />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300 ease-in-out",
          mainContentMargin
        )}
      >
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        <AppFooter />
      </div>
    </div>
  );
};

export default AppLayout;
