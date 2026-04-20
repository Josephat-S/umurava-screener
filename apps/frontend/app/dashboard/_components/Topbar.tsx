"use client";

import React, { useState } from 'react';
import { Menu, ChevronDown, Bell, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TopbarProps {
  toggleSidebar: () => void;
  toggleMobile: () => void;
}

export default function Topbar({ toggleSidebar, toggleMobile }: TopbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    setIsProfileOpen(false);
    // You can add session clearing logic here
    router.push('/login');
  };

  // FIXED: Changed z-10 to z-30 so the dropdowns stay above the chart bars
  return (
    <div className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30">
      
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
        
        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              if (isProfileOpen) setIsProfileOpen(false); // Close profile if open
            }}
            className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors mr-2 focus:outline-none"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {isNotificationOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center mb-1">
                  <p className="text-sm font-bold text-[#3b82f6]">Notifications</p>
                  <button className="text-xs font-medium text-[#3b82f6] hover:underline">Mark all as read</button>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {/* Dummy Notification 1 */}
                  <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors cursor-pointer">
                    <p className="text-sm text-gray-800 font-medium">Screening completed</p>
                    <p className="text-xs text-gray-500 mt-0.5">AI Screening finished for Frontend Developer. 2 strong matches found.</p>
                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">2 mins ago</p>
                  </div>
                  
                  {/* Dummy Notification 2 */}
                  <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors cursor-pointer">
                    <p className="text-sm text-gray-800 font-medium">New candidates imported</p>
                    <p className="text-xs text-gray-500 mt-0.5">5 new resumes were successfully parsed and added to the pool.</p>
                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">1 hour ago</p>
                  </div>

                  {/* Dummy Notification 3 */}
                  <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                    <p className="text-sm text-gray-800 font-medium">System Update</p>
                    <p className="text-xs text-gray-500 mt-0.5">The AI screening algorithm has been updated for better accuracy.</p>
                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">Yesterday</p>
                  </div>
                </div>

                <div className="px-4 py-2 mt-1 border-t border-gray-100 text-center">
                  <button 
                    onClick={() => setIsNotificationOpen(false)}
                    className="text-xs font-medium text-gray-500 hover:text-[#3b82f6] transition-colors"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <div 
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              if (isNotificationOpen) setIsNotificationOpen(false); // Close notifications if open
            }}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors select-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-xs font-bold tracking-wider">
              RA
              </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">Recruiter Admin</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </div>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-100 mb-1">
                  <p className="break-words text-sm font-semibold text-gray-800">Recruiter Admin</p>
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
                  onClick={handleLogout}
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