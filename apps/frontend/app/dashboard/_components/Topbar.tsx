"use client";

import React, { useState } from 'react';
import { Menu, ChevronDown, Bell, User, LogOut } from 'lucide-react';

interface TopbarProps {
  toggleSidebar: () => void;
  toggleMobile: () => void;
}

export default function Topbar({ toggleSidebar, toggleMobile }: TopbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-10">
      
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar} 
          className="hidden md:block text-gray-500 hover:bg-gray-100 p-2 rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button 
          onClick={toggleMobile} 
          className="md:hidden text-gray-500 hover:bg-gray-100 p-2 rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors mr-2">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="relative">
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors select-none"
          >
            {/* Updated Avatar Color */}
            <div className="w-8 h-8 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-xs font-bold tracking-wider">
              RA
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">Recruiter Admin</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </div>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-100 mb-1">
                  <p className="text-sm font-semibold text-gray-800">Recruiter Admin</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">admin@umurava.africa</p>
                </div>
                <button 
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-400" /> 
                  My Profile
                </button>
                <button 
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4 text-red-500" /> 
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}