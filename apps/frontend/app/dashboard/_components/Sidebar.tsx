"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, Briefcase, Users, Zap, X } from 'lucide-react';
import umuravaLogo from '../../umuravalogo.png'; 

const navItems = [
  { name: 'DASHBOARD', desc: 'Overview & metrics', icon: BarChart2, path: '/dashboard' },
  { name: 'JOB POSTINGS', desc: 'Create & manage jobs', icon: Briefcase, path: '/dashboard/job-postings' },
  { name: 'CANDIDATES', desc: 'Applicant management', icon: Users, path: '/dashboard/candidates' },
  { name: 'AI SCREENING', desc: 'Evaluate & rank', icon: Zap, path: '/dashboard/ai-screening' },
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

      {/* Changed background to #260af5 */}
      <div 
        className={`fixed left-0 top-0 h-screen bg-[#260af5] text-white flex flex-col z-30 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-72'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className={`p-6 flex items-center h-[72px] ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="shrink-0 flex items-center justify-center">
              <Image src={umuravaLogo} alt="Umurava Logo" width={32} height={32} className="object-contain" />
            </div>
            {!isCollapsed && <span className="text-xl font-bold">Umurava</span>}
          </div>
          <button className="md:hidden p-1 hover:bg-white/10 rounded-lg" onClick={() => setIsMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-4 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path; 
            
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`p-3 rounded-xl flex items-center transition-colors ${
                  isActive ? 'bg-white/10' : 'hover:bg-white/5'
                } ${isCollapsed ? 'justify-center' : 'justify-start gap-3'}`}
                title={isCollapsed ? item.name : undefined}
              >
                {/* Changed text-purple-200 to text-blue-200 */}
                <Icon className={`shrink-0 w-5 h-5 text-blue-200`} />
                
                {!isCollapsed && (
                  <div className="whitespace-nowrap">
                    <div className="font-bold text-sm tracking-wide">{item.name}</div>
                    {/* Changed text-purple-200 to text-blue-200 */}
                    <div className="text-xs text-blue-200 mt-0.5">{item.desc}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}