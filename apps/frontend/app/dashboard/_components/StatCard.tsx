import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: ReactNode;
  iconBgColor: string;
}

export default function StatCard({ title, value, subtext, icon, iconBgColor }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`p-2 rounded-lg text-white ${iconBgColor}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{subtext}</p>
      </div>
    </div>
  );
}
