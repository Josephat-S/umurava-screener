import React from 'react';
import { Plus, ChevronDown } from 'lucide-react';

export default function CreateJobPostingPage() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create Job Posting</h1>
        <p className="text-gray-500 text-sm mt-1">Define your ideal candidate profile for AI-powered screening.</p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Job Details</h2>

        <form className="space-y-6">
          {/* Row 1: Title and Department (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Senior AI Engineer"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select 
                  defaultValue=""
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm appearance-none bg-white text-gray-600"
                >
                  <option value="" disabled>Select department</option>
                  <option value="engineering">Engineering</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 2: Role Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              placeholder="Describe the role, responsibilities, and what makes a great candidate..."
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm resize-y"
            ></textarea>
          </div>

          {/* Row 3: Required Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a skill and press Enter"
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
              />
              <button 
                type="button" 
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Row 4: Experience Level and Country (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <div className="relative">
                <select 
                  defaultValue=""
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm appearance-none bg-white text-gray-600"
                >
                  <option value="" disabled>Select experience level</option>
                  <option value="junior">Junior (1-3 years)</option>
                  <option value="mid">Mid-level (3-5 years)</option>
                  <option value="senior">Senior (5+ years)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <div className="relative">
                <select 
                  defaultValue=""
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm appearance-none bg-white text-gray-600"
                >
                  <option value="" disabled>Select your country</option>
                  <option value="rwanda">Rwanda</option>
                  <option value="kenya">Kenya</option>
                  <option value="nigeria">Nigeria</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="pt-8 mt-6 border-t border-gray-100 flex justify-end gap-4">
            <button 
              type="button" 
              className="px-6 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              &lt; Previous
            </button>
            <button 
              type="button" 
              className="px-8 py-2 text-sm font-medium text-white bg-[#260af5] rounded-lg hover:bg-[#1a05cc] transition-colors"
            >
              Next &gt;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}