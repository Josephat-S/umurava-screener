"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Briefcase, Sparkles, TrendingUp, Users } from "lucide-react";
import EmptyState from "./_components/EmptyState";
import RecentActivity from "./_components/RecentActivity";
import StatCard from "./_components/StatCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAnalyticsSummary } from "@/store/slices/analyticsSlice";
import { fetchJobs } from "@/store/slices/jobSlice";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { jobs, loading, error } = useAppSelector((state) => state.jobs);
  const {
    summary: analytics,
    error: analyticsError,
  } = useAppSelector((state) => state.analytics);

  useEffect(() => {
    void dispatch(fetchJobs());
    void dispatch(fetchAnalyticsSummary());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3b82f6]">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage jobs, applicants, and screening decisions from one place.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/candidates"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            View Candidates
          </Link>
          <Link
            href="/dashboard/job-postings"
            className="px-5 py-2 text-sm font-medium text-white bg-[#3b82f6] rounded-lg hover:bg-[#2563eb] transition-colors shadow-sm"
          >
            Create Job
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card 1: Default White */}
        <StatCard
          title="Total Jobs"
          value={analytics.totalJobs}
          subtext="Roles configured in the screening pipeline"
          icon={<Briefcase size={20} />}
          iconBgColor="bg-[#3b82f6]"
        />
        {/* Card 2: Primary Blue Focus */}
        <StatCard
          title="Candidates Screened"
          value={analytics.totalScreened}
          subtext="Applicants processed across screening runs"
          icon={<Users size={20} />}
          isPrimary={true}
        />
        {/* Card 3: Default White */}
        <StatCard
          title="Avg Match Score"
          value={`${analytics.avgMatchScore}%`}
          subtext="Average shortlist quality across completed runs"
          icon={<TrendingUp size={20} />}
          iconBgColor="bg-green-500"
        />
        {/* Card 4 (Last): Primary Blue Focus */}
        <StatCard
          title="Top Skill In Demand"
          value={analytics.topSkill}
          subtext="Most requested skill across your job postings"
          icon={<Sparkles size={20} />}
          isPrimary={true}
        />
      </div>

      {(error || analyticsError) && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          {error || analyticsError}
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="bg-white rounded-xl border border-gray-100 shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#3b82f6]">Recent Job Postings</h2>
              <p className="text-sm text-gray-500 mt-1">
                Your latest roles ready for applicants and screening.
              </p>
            </div>
            <Link
              href="/dashboard/job-postings"
              className="text-sm font-medium text-[#3b82f6] hover:text-[#2563eb]"
            >
              Manage Jobs
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="h-6 w-6" />}
              title="No jobs yet"
              description="Create your first role to start collecting candidates and generating analytics."
              actionLabel="Create a Job"
              actionHref="/dashboard/job-postings"
            />
          ) : (
            <div className="space-y-4">
              {jobs.slice(0, 4).map((job) => (
                <article
                  key={job._id}
                  className="rounded-xl border border-gray-100 bg-gray-50/70 p-5 hover:bg-white hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-gray-800">
                          {job.title}
                        </h3>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          Top {job.shortlistSize}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-white px-2.5 py-1 text-xs text-gray-600 border border-gray-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="md:text-right">
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Created
                      </p>
                      <p className="text-sm font-medium text-gray-700 mt-1">
                        {formatDate(job.createdAt)}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2 md:justify-end">
                        <Link
                          href={`/dashboard/candidates?jobId=${job._id}`}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                        >
                          Candidates
                        </Link>
                        <Link
                          href={`/dashboard/ai-screening?jobId=${job._id}`}
                          className="rounded-lg bg-[#3b82f6] px-3 py-2 text-sm font-medium text-white hover:bg-[#2563eb] shadow-sm"
                        >
                          Screen
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <RecentActivity jobs={jobs} />
      </div>
    </div>
  );
}
