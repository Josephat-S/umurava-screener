// app/dashboard/_components/RecentActivity.tsx
import React from 'react';
import { Briefcase, UserCheck, Users, TrendingUp } from 'lucide-react';

// Sample data based on the image, updated with the new brand color
const activities = [
  {
    id: 1,
    title: "Job Posting 'Senior AI Engineer Rwanda' created",
    time: "2 hours ago",
    icon: <Briefcase size={18} className="text-[#260af5]" />,
    iconBg: "bg-[#260af5]/10",
  },
  {
    id: 2,
    title: "'John Doe' parsed and ranked — Match Score: 89%",
    time: "3 hours ago",
    icon: <TrendingUp size={18} className="text-[#260af5]" />,
    iconBg: "bg-[#260af5]/10",
  },
  {
    id: 3,
    title: "'Jane Smith' CV uploaded and parsed",
    time: "5 hours ago",
    icon: <Users size={18} className="text-[#260af5]" />,
    iconBg: "bg-[#260af5]/10",
  },
  {
    id: 4,
    title: "AI Screening completed for 'Data Scientist' role",
    time: "1 day ago",
    icon: <UserCheck size={18} className="text-[#260af5]" />,
    iconBg: "bg-[#260af5]/10",
  },
];

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-6 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Recent Activity</h2>
      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${activity.iconBg}`}>
              {activity.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{activity.title}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}