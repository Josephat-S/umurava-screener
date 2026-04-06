// app/dashboard/page.tsx
import React from 'react';
import StatCard from './_components/StatCard';
import RecentActivity from './_components/RecentActivity';
import { Briefcase, Users, Zap, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's your recruiting overview.</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Jobs" 
          value="12" 
          subtext="+3 this week" 
          icon={<Briefcase size={20} />} 
          iconBgColor="bg-purple-600" 
        />
        <StatCard 
          title="Candidates Screened" 
          value="284" 
          subtext="+47 today" 
          icon={<Users size={20} />} 
          iconBgColor="bg-purple-400" 
        />
        <StatCard 
          title="Top Talent Found" 
          value="38" 
          subtext="+8 this week" 
          icon={<Zap size={20} />} 
          iconBgColor="bg-green-500" 
        />
        <StatCard 
          title="Avg. Match Score" 
          value="72%" 
          subtext="+5% vs last month" 
          icon={<TrendingUp size={20} />} 
          iconBgColor="bg-yellow-500" 
        />
      </div>

      {/* Recent Activity List */}
      <RecentActivity />
    </div>
  );
}