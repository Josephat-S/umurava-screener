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
    <div className="bg-white rounded-xl border border-gray-100 shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center gap-2 mb-8">
        <BarChart3 className="h-5 w-5 text-[#3b82f6]" />
        <div>
          <h2 className="text-lg font-bold text-[#3b82f6]">Trending Skills</h2>
        </div>
      </div>
      
      <div className="relative h-64 mt-4">
        {/* Grid Lines & Y-Axis (Background) */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {ticks.map((tick, i) => {
            // Prevent showing duplicate numbers if the max value is very small
            const isDuplicate = i > 0 && tick === ticks[i - 1];
            return (
              <div key={i} className="flex items-center w-full h-0">
                <span className="w-8 text-right text-xs font-medium text-gray-400 mr-4 transform -translate-y-1/2">
                  {!isDuplicate ? tick : ""}
                </span>
                <div className={`flex-1 border-b ${i === ticks.length - 1 ? 'border-gray-300' : 'border-gray-100 border-dashed'}`}></div>
              </div>
            );
          })}
        </div>

        {/* Interactive Bars Area (Foreground) */}
        <div className="absolute inset-0 flex items-end justify-between pl-12 z-10 pb-[1px]">
          {data.map((item) => (
             <div key={item.label} className="w-full flex flex-col justify-end items-center h-full group cursor-pointer">
                
                {/* Number directly above the bar (Matching your reference image) */}
                <span className={`text-xs font-bold text-gray-700 mb-2 transition-all duration-200 group-hover:text-[#3b82f6] group-hover:-translate-y-1 ${item.value > 0 ? 'opacity-100' : 'opacity-0'}`}>
                  {item.value}
                </span>
                
                {/* The Bar (Fully rounded top and bottom) */}
                <div
                  className="w-full max-w-[48px] bg-[#3b82f6]/85 rounded-xl relative transition-all duration-300 group-hover:bg-[#3b82f6]"
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
      <div className="flex items-center justify-between pl-12 mt-4">
        {data.map((item) => (
          <div key={item.label} className="w-full flex justify-center text-center group cursor-pointer">
             <span className="text-xs font-medium text-gray-500 group-hover:text-[#3b82f6] transition-colors truncate px-1">
               {item.label}
             </span>
          </div>
        ))}
      </div>
    </div>
  );
}