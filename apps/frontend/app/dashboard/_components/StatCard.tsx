import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: ReactNode;
  iconBgColor?: string; // Made optional since primary cards don't need it
  isPrimary?: boolean;  // New prop to trigger the blue focus state
}

export default function StatCard({ 
  title, 
  value, 
  subtext, 
  icon, 
  iconBgColor = "bg-blue-500", 
  isPrimary = false 
}: StatCardProps) {
  return (
    <div 
      className={`min-w-0 rounded-xl border p-4 shadow-md transition-shadow duration-200 hover:shadow-lg sm:p-5 lg:p-6 flex flex-col justify-between ${
        isPrimary 
          ? 'bg-[#3b82f6] border-[#3b82f6] text-white' 
          : 'bg-white border-gray-100'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className={`min-w-0 text-sm font-medium ${isPrimary ? 'text-blue-100' : 'text-gray-500'}`}>
          {title}
        </h3>
        <div className={`p-2 rounded-lg text-white ${isPrimary ? 'bg-white/20' : iconBgColor}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className={`text-2xl font-bold sm:text-3xl ${isPrimary ? 'text-white' : 'text-gray-800'}`}>
          {value}
        </p>
        <p className={`mt-1 text-xs leading-5 ${isPrimary ? 'text-blue-100' : 'text-gray-400'}`}>
          {subtext}
        </p>
      </div>
    </div>
  );
}
