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
      className={`p-6 rounded-xl border shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between ${
        isPrimary 
          ? 'bg-[#3b82f6] border-[#3b82f6] text-white' 
          : 'bg-white border-gray-100'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className={`text-sm font-medium ${isPrimary ? 'text-blue-100' : 'text-gray-500'}`}>
          {title}
        </h3>
        <div className={`p-2 rounded-lg text-white ${isPrimary ? 'bg-white/20' : iconBgColor}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className={`text-3xl font-bold ${isPrimary ? 'text-white' : 'text-gray-800'}`}>
          {value}
        </p>
        <p className={`text-xs mt-1 ${isPrimary ? 'text-blue-100' : 'text-gray-400'}`}>
          {subtext}
        </p>
      </div>
    </div>
  );
}
