import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import type { Job } from "@/types";

interface OverviewChartProps {
  jobs: Job[];
}

export default function OverviewChart({ jobs }: OverviewChartProps) {
  // Dynamically calculate trending skills from real job data
  const data = useMemo(() => {
    const skillCounts: Record<string, number> = {};
    
    // Count occurrences of every skill across all jobs
    jobs.forEach(job => {
      job.skills.forEach(skill => {
        // Normalize skill strings slightly to prevent duplicates
        const normalizedSkill = skill.trim(); 
        skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1;
      });
    });

    // Convert to an array, sort by highest count, and grab the top 6
    const sortedSkills = Object.entries(skillCounts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // If there are no jobs or skills yet, provide an empty placeholder structure
    if (sortedSkills.length === 0) {
      return [
        { label: "React", value: 0 },
        { label: "Python", value: 0 },
        { label: "UI/UX", value: 0 },
        { label: "AI/ML", value: 0 },
        { label: "Node.js", value: 0 },
        { label: "Figma", value: 0 },
      ];
    }

    return sortedSkills;
  }, [jobs]);
  
  // Find the highest value to scale the bars correctly
  const max = Math.max(...data.map(d => d.value), 1);
  
  // Create 5 mathematically spaced ticks for the Y-axis
  const ticks = [
    max,
    Math.round(max * 0.75),
    Math.round(max * 0.5),
    Math.round(max * 0.25),
    0
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="mb-6 flex items-center gap-2 sm:mb-8">
        <BarChart3 className="h-5 w-5 text-[#3b82f6]" />
        <div>
          <h2 className="text-base font-bold text-[#3b82f6] sm:text-lg">Trending Skills</h2>
        </div>
      </div>
      
      <div className="relative mt-4 h-44 overflow-hidden sm:h-56 lg:h-64">
        {/* Grid Lines & Y-Axis (Background) */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {ticks.map((tick, i) => {
            // Prevent showing duplicate numbers if the max value is very small
            const isDuplicate = i > 0 && tick === ticks[i - 1];
            return (
              <div key={i} className="flex h-0 w-full items-center">
                <span className="mr-3 w-7 -translate-y-1/2 text-right text-[10px] font-medium text-gray-400 sm:mr-4 sm:w-8 sm:text-xs">
                  {!isDuplicate ? tick : ""}
                </span>
                <div className={`flex-1 border-b ${i === ticks.length - 1 ? 'border-gray-300' : 'border-gray-100 border-dashed'}`}></div>
              </div>
            );
          })}
        </div>

        {/* Interactive Bars Area (Foreground) */}
        <div className="absolute inset-0 z-10 flex items-end justify-between pb-[1px] pl-9 sm:pl-12">
          {data.map((item) => (
             <div key={item.label} className="group flex h-full w-full flex-col items-center justify-end cursor-pointer">
                
                {/* Number directly above the bar (Matching your reference image) */}
                <span className={`mb-2 text-[10px] font-bold text-gray-700 transition-all duration-200 group-hover:-translate-y-1 group-hover:text-[#3b82f6] sm:text-xs ${item.value > 0 ? 'opacity-100' : 'opacity-0'}`}>
                  {item.value}
                </span>
                
                {/* The Bar (Fully rounded top and bottom) */}
                <div
                  className="relative w-full max-w-[36px] rounded-xl bg-[#3b82f6]/85 transition-all duration-300 group-hover:bg-[#3b82f6] sm:max-w-[48px]"
                  style={{ 
                    height: `${(item.value / max) * 100}%`, 
                    minHeight: item.value > 0 ? '12px' : '0' 
                  }}
                >
                </div>
             </div>
          ))}
        </div>
      </div>

      {/* X-Axis Labels (Bottom) */}
      <div className="mt-4 flex items-center justify-between pl-9 sm:pl-12">
        {data.map((item) => (
          <div key={item.label} className="group flex w-full cursor-pointer justify-center text-center">
             <span className="max-w-[52px] truncate px-1 text-[10px] font-medium text-gray-500 transition-colors group-hover:text-[#3b82f6] sm:max-w-none sm:text-xs">
               {item.label}
             </span>
          </div>
        ))}
      </div>
    </div>
  );
}