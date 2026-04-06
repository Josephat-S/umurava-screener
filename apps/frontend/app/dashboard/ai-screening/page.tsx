import React from 'react';
import { Zap, Award, ChevronRight, ChevronDown } from 'lucide-react';

// Mock data matching the design exactly
const rankedCandidates = [
  { id: 1, rank: 1, name: 'Alice Williams', score: 92, recommendation: 'Strong Match', job: 'Senior AI Engineer' },
  { id: 2, rank: 2, name: 'John Doe', score: 89, recommendation: 'Strong Match', job: 'Senior AI Engineer' },
  { id: 3, rank: 3, name: 'Grace Uwimana', score: 81, recommendation: 'Moderate Match', job: 'Backend Engineer' },
  { id: 4, rank: 4, name: 'Jane Smith', score: 74, recommendation: 'Moderate Match', job: 'Full Stack Developer' },
];

// Helper for progress bar color
const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-[#00C853]'; // Bright Green
  return 'bg-[#FF9800]'; // Orange
};

// Helper for recommendation badge styling
const RecommendationBadge = ({ text }: { text: string }) => {
  if (text === 'Strong Match') {
    return (
      <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded-full text-xs font-medium">
        {text}
      </span>
    );
  }
  return (
    <span className="px-3 py-1 bg-orange-50 text-orange-500 border border-orange-200 rounded-full text-xs font-medium">
      {text}
    </span>
  );
};

export default function AIScreeningPage() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      {/* Header Section with Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI Screening</h1>
          <p className="text-gray-500 text-sm mt-1">Run AI-powered candidate evaluation and ranking.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              defaultValue="senior-ai"
              className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="senior-ai">Senior AI Engineer</option>
              <option value="backend">Backend Engineer</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <button className="flex items-center gap-2 bg-[#260af5] hover:bg-[#1a05cc] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Zap className="w-4 h-4" />
            Run AI Screening
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#260af5]" />
          <h2 className="text-lg font-bold text-gray-800">Ranked Candidates</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-sm text-gray-500 border-b border-gray-100">
                <th className="py-4 pl-6 pr-4 font-medium w-24">Rank</th>
                <th className="py-4 px-4 font-medium">Name</th>
                <th className="py-4 px-4 font-medium">Match Score</th>
                <th className="py-4 px-4 font-medium">Recommendation</th>
                <th className="py-4 px-4 font-medium">Job</th>
                <th className="py-4 px-6"></th>
              </tr>
            </thead>
            <tbody>
              {rankedCandidates.map((candidate) => (
                <tr key={candidate.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer">
                  <td className="py-4 pl-6 pr-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      candidate.rank === 1 
                        ? 'bg-[#260af5] text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      #{candidate.rank}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-800">
                    {candidate.name}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${getScoreColor(candidate.score)}`} 
                          style={{ width: `${candidate.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-800">{candidate.score}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <RecommendationBadge text={candidate.recommendation} />
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {candidate.job}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#260af5] transition-colors ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
}