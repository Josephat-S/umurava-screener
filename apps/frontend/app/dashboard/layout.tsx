"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Sidebar from './_components/Sidebar';
import Topbar from './_components/Topbar';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-200 overflow-x-hidden">
      <Sidebar 
        isCollapsed={isCollapsed} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />
      
      {/* Main Content Area - Margins adjust based on sidebar state */}
      <div 
        className={`flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out 
        ${isCollapsed ? 'md:ml-20' : 'md:ml-72'} ml-0`}
      >
        <Topbar 
          toggleSidebar={() => setIsCollapsed(!isCollapsed)} 
          toggleMobile={() => setIsMobileOpen(!isMobileOpen)} 
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}