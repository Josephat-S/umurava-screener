import React from 'react';
import { Menu, ChevronDown } from 'lucide-react';

interface TopbarProps {
  toggleSidebar: () => void;
  toggleMobile: () => void;
}

export default function Topbar({ toggleSidebar, toggleMobile }: TopbarProps) {
  return (
    <div className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      
      {/* Desktop Toggle */}
      <button 
        onClick={toggleSidebar} 
        className="hidden md:block text-gray-500 hover:bg-gray-100 p-2 rounded-md transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Toggle */}
      <button 
        onClick={toggleMobile} 
        className="md:block hidden md:hidden text-gray-500 hover:bg-gray-100 p-2 rounded-md transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Right side user profile */}
      <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors ml-auto">
        <div className="w-8 h-8 rounded-full bg-[#5D18FF] text-white flex items-center justify-center text-xs font-bold tracking-wider">
          RA
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">Recruiter Admin</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}