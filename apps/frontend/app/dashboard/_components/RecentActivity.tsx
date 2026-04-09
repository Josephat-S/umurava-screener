import React from "react";
import { Briefcase, Sparkles, Users, Zap } from "lucide-react";
import type { Job } from "@/types";

interface RecentActivityProps {
  jobs: Job[];
}

function formatRelativeTime(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export default function RecentActivity({ jobs }: RecentActivityProps) {
  const activities = jobs.slice(0, 4).map((job, index) => {
    const variants = [
      {
        icon: <Briefcase size={18} className="text-[#3b82f6]" />,
        iconBg: "bg-[#3b82f6]/10",
        title: `Job posting '${job.title}' created`,
      },
      {
        icon: <Users size={18} className="text-[#3b82f6]" />,
        iconBg: "bg-[#3b82f6]/10",
        title: `'${job.title}' is ready for applicants`,
      },
      {
        icon: <Zap size={18} className="text-[#3b82f6]" />,
        iconBg: "bg-[#3b82f6]/10",
        title: `AI screening can now be run for '${job.title}'`,
      },
      {
        icon: <Sparkles size={18} className="text-[#3b82f6]" />,
        iconBg: "bg-[#3b82f6]/10",
        title: `'${job.title}' shortlist set to top ${job.shortlistSize}`,
      },
    ];

    return {
      id: job._id,
      time: formatRelativeTime(job.createdAt),
      ...variants[index % variants.length],
    };
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-md mt-6 p-4 sm:p-6">
      <h2 className="mb-6 text-lg font-semibold text-[#3b82f6]">Recent Activity</h2>
      {activities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
          <p className="text-sm font-medium text-gray-600">No recent activity yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            Create a job to start building your screening pipeline.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="flex min-w-0 items-start gap-3 sm:gap-4">
              <div className={`shrink-0 rounded-lg p-2 ${activity.iconBg}`}>
                {activity.icon}
              </div>
              <div className="min-w-0">
                <p className="break-words text-sm font-medium text-gray-800">
                  {activity.title}
                </p>
                <p className="mt-1 text-xs text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
