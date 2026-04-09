"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, Briefcase, Users, Zap, X } from 'lucide-react';
import umuravaLogo from '../../umuravalogo.png'; 

const navItems = [
  // Changed to Title Case to match your image reference
  { name: 'Dashboard', icon: BarChart2, path: '/dashboard' },
  { name: 'Job Postings', icon: Briefcase, path: '/dashboard/job-postings' },
  { name: 'Candidates', icon: Users, path: '/dashboard/candidates' },
  { name: 'AI Screening', icon: Zap, path: '/dashboard/ai-screening' },
];

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

export default function Sidebar({ isCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Changed background from #260af5 to #3b82f6 (Tailwind blue-500) to perfectly match the image's vibrant blue */}
      <div 
        className={`fixed left-0 top-0 h-screen bg-[#3b82f6] text-white flex flex-col z-30 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-[84vw] max-w-72 md:w-72'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className={`flex h-[72px] items-center p-4 sm:p-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex min-w-0 items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="shrink-0 flex items-center justify-center">
              <Image src={umuravaLogo} alt="Umurava Logo" width={32} height={32} className="object-contain" />
            </div>
            {/* Added your reference text from the image */}
            {!isCollapsed && <span className="min-w-0 truncate text-2xl font-black tracking-tight lowercase">umurava.Ai</span>}
          </div>
          <button className="md:hidden p-1 hover:bg-white/10 rounded-lg" onClick={() => setIsMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-3 sm:px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path; 
            
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center rounded-xl px-3 py-3 transition-all duration-200 sm:px-4 ${
                  isActive 
                    ? 'bg-white text-[#3b82f6] shadow-sm font-semibold' // Active state: White bg, blue text
                    : 'text-white hover:bg-white/10 font-medium'        // Inactive state: White text, soft hover
                } ${isCollapsed ? 'justify-center' : 'justify-start gap-4'}`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`shrink-0 w-5 h-5 ${isActive ? 'text-[#3b82f6]' : 'text-white'}`} />
                
                {!isCollapsed && (
                  <span className="min-w-0 truncate whitespace-nowrap text-[15px]">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
