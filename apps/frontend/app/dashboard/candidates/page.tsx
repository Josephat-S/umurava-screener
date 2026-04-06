"use client";

import React, { useState } from 'react';
import { Search, Filter, Upload } from 'lucide-react';

// Mock data based on your design
const candidatesData = [
  { id: 1, name: 'John Doe', score: '89%', role: 'Senior AI Engineer', date: '2026-04-01', status: 'Screened' },
  { id: 2, name: 'Jane Smith', score: '74%', role: 'Full Stack Developer', date: '2026-04-02', status: 'Parsed' },
  { id: 3, name: 'Bob Johnson', score: '—', role: 'Backend Engineer', date: '2026-04-03', status: 'New' },
  { id: 4, name: 'Alice Williams', score: '92%', role: 'Senior AI Engineer', date: '2026-03-28', status: 'Screened' },
  { id: 5, name: 'David Brown', score: '—', role: 'Frontend Developer', date: '2026-04-04', status: 'New' },
  { id: 6, name: 'Grace Uwimana', score: '81%', role: 'Backend Engineer', date: '2026-04-01', status: 'Screened' },
];

// Helper function to color code the Match Score
const getScoreColor = (score: string) => {
  if (score === '—') return 'text-gray-400';
  const num = parseInt(score.replace('%', ''));
  if (num >= 80) return 'text-green-500 font-medium';
  if (num >= 70) return 'text-orange-500 font-medium';
  return 'text-gray-800';
};

// Helper component for the Status Badge
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'Screened':
      return <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded-full text-xs font-medium">Screened</span>;
    case 'Parsed':
      return <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-medium">Parsed</span>;
    case 'New':
    default:
      return <span className="px-3 py-1 bg-gray-50 text-gray-500 border border-gray-200 rounded-full text-xs font-medium">New</span>;
  }
};

export default function CandidatesPage() {
  // State to manage which tab is currently active
  const [activeTab, setActiveTab] = useState<'structured' | 'external'>('structured');

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Candidates</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and review all applicants across job postings.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('structured')}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === 'structured' 
              ? 'text-[#260af5] border-b-2 border-[#260af5]' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Structured Data
        </button>
        <button 
          onClick={() => setActiveTab('external')}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === 'external' 
              ? 'text-[#260af5] border-b-2 border-[#260af5]' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          External Uploads
        </button>
      </div>

      {/* Conditional Rendering based on Active Tab */}
      {activeTab === 'structured' ? (
        
        /* ----------------------------------------------------
           TAB 1: STRUCTURED DATA (Table) 
           ---------------------------------------------------- */
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
          {/* Card Header (Title & Controls) */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">All Candidates</h2>
            
            <div className="flex items-center gap-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search candidates..." 
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors w-full sm:w-64"
                />
              </div>
              
              {/* Filter Button */}
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                All Status
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-sm text-gray-500 border-b border-gray-100">
                  <th className="py-4 pl-6 pr-4 w-12">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  </th>
                  <th className="py-4 px-4 font-medium">Name</th>
                  <th className="py-4 px-4 font-medium">Match Score</th>
                  <th className="py-4 px-4 font-medium">Job Applied</th>
                  <th className="py-4 px-4 font-medium">Applied Date</th>
                  <th className="py-4 px-6 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {candidatesData.map((candidate) => (
                  <tr key={candidate.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 pl-6 pr-4">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-800">{candidate.name}</td>
                    <td className={`py-4 px-4 text-sm ${getScoreColor(candidate.score)}`}>
                      {candidate.score}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{candidate.role}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{candidate.date}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={candidate.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      
      ) : (

        /* ----------------------------------------------------
           TAB 2: EXTERNAL UPLOADS (Drag & Drop) 
           ---------------------------------------------------- */
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-10 animate-in fade-in duration-300">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Upload CVs or CSV</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-gray-50/50 transition-colors cursor-pointer group">
            <Upload className="w-10 h-10 text-gray-500 mb-4 group-hover:text-blue-600 transition-colors" strokeWidth={1.5} />
            <h3 className="text-base font-semibold text-gray-800 mb-1">Drag & Drop Files Here</h3>
            <p className="text-sm text-gray-500 mb-6">Support for PDF (CVs) and CSV files</p>
            
            <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
              Browse Files
            </button>
            
            {/* Hidden file input for actual functionality later */}
            <input type="file" multiple className="hidden" accept=".pdf,.csv" />
          </div>
        </div>

      )}
    </div>
  );
}