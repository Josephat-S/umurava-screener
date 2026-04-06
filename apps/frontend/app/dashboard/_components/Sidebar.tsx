import React from 'react';
import Image from 'next/image';
import { BarChart2, Briefcase, Users, Zap, X } from 'lucide-react';
// Import the logo directly from your app folder
import umuravaLogo from '../../umuravalogo.png'; 

const navItems = [
  { name: 'DASHBOARD', desc: 'Overview & metrics', icon: BarChart2, active: true },
  { name: 'JOB POSTINGS', desc: 'Create & manage jobs', icon: Briefcase, active: false },
  { name: 'CANDIDATES', desc: 'Applicant management', icon: Users, active: false },
  { name: 'AI SCREENING', desc: 'Evaluate & rank', icon: Zap, active: false },
];

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

export default function Sidebar({ isCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  return (
    <>
      {/* Mobile Dark Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`fixed left-0 top-0 h-screen bg-[#5D18FF] text-white flex flex-col z-30 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-72'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand / Logo Area */}
        <div className={`p-6 flex items-center h-[72px] ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="shrink-0 flex items-center justify-center">
              <Image 
                src={umuravaLogo} 
                alt="Umurava Logo" 
                width={32} 
                height={32} 
                className="object-contain"
              />
            </div>
            {/* Hide text when collapsed */}
            {!isCollapsed && <span className="text-xl font-bold">Umurava</span>}
          </div>
          
          {/* Close button strictly for mobile view */}
          <button 
            className="md:hidden p-1 hover:bg-white/10 rounded-lg" 
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-2 mt-4 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className={`p-3 rounded-xl flex items-center cursor-pointer transition-colors ${
                  item.active ? 'bg-white/10' : 'hover:bg-white/5'
                } ${isCollapsed ? 'justify-center' : 'justify-start gap-3'}`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`shrink-0 w-5 h-5 text-purple-200`} />
                
                {/* Hide text when collapsed, keep it from wrapping with whitespace-nowrap */}
                {!isCollapsed && (
                  <div className="whitespace-nowrap">
                    <div className="font-bold text-sm tracking-wide">{item.name}</div>
                    <div className="text-xs text-purple-200 mt-0.5">{item.desc}</div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}