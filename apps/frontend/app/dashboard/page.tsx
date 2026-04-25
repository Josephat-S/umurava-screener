"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Briefcase, Sparkles, TrendingUp, Users } from "lucide-react";
import EmptyState from "./_components/EmptyState";
import RecentActivity from "./_components/RecentActivity";
import StatCard from "./_components/StatCard";
import OverviewChart from "./_components/OverviewChart";
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
  const { jobs, loading: jobsLoading, error } = useAppSelector((state) => state.jobs);
  const {
    summary: analytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useAppSelector((state) => state.analytics);

  useEffect(() => {
    void dispatch(fetchJobs());
    void dispatch(fetchAnalyticsSummary());
  }, [dispatch]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl bg-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3b82f6]">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage jobs, applicants, and screening decisions from one place.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Link
            href="/dashboard/candidates"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-center"
          >
            View Candidates
          </Link>
          <Link
            href="/dashboard/job-postings"
            className="px-5 py-2 text-sm font-medium text-white bg-[#3b82f6] rounded-lg hover:bg-[#2563eb] transition-colors shadow-sm text-center"
          >
            Create Job
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {analyticsLoading ? (
          /* Shimmer for the 4 StatCards */
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-md sm:p-5 lg:p-6 flex flex-col justify-between animate-pulse h-[138px]">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-9 w-9 rounded-lg bg-gray-200"></div>
              </div>
              <div>
                <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          <>
            {/* Card 1: Primary Blue Focus */}
            <StatCard
              title="Total Jobs"
              value={analytics.totalJobs}
              subtext="Roles configured in the screening pipeline"
              icon={<Briefcase size={20} />}
              isPrimary={true}
            />
            {/* Card 2: Default White */}
            <StatCard
              title="Candidates Screened"
              value={analytics.totalScreened}
              subtext="Applicants processed across screening runs"
              icon={<Users size={20} />}
              iconBgColor="bg-blue-500"
            />
            {/* Card 3: Primary Blue Focus */}
            <StatCard
              title="Avg Match Score"
              value={`${analytics.avgMatchScore}%`}
              subtext="Average shortlist quality across completed runs"
              icon={<TrendingUp size={20} />}
              isPrimary={true}
            />
            {/* Card 4: Default White */}
            <StatCard
              title="Top Skill In Demand"
              value={analytics.topSkill}
              subtext="Most requested skill across your job postings"
              icon={<Sparkles size={20} />}
              iconBgColor="bg-blue-500"
            />
          </>
        )}
      </div>

      {(error || analyticsError) && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          {error || analyticsError}
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="bg-white rounded-xl border border-gray-100 shadow-md p-4 sm:p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

          {jobsLoading ? (
            /* Shimmer Loading Skeleton */
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="w-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-5 w-48 bg-gray-200 rounded"></div>
                        <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                      </div>
                      <div className="h-3 w-3/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-1/2 bg-gray-200 rounded mb-4"></div>
                      <div className="flex flex-wrap gap-2">
                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                        <div className="h-6 w-14 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                    <div className="w-full md:w-auto md:text-right flex flex-col md:items-end">
                      <div className="h-2 w-16 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded mb-5"></div>
                      <div className="mt-4 flex flex-wrap gap-2 md:justify-end">
                        <div className="h-9 w-24 bg-gray-200 rounded-lg"></div>
                        <div className="h-9 w-20 bg-blue-200 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                  className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5 hover:bg-white hover:shadow-md transition-all duration-200"
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
                          className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm sm:px-3 sm:text-sm"
                        >
                          Candidates
                        </Link>
                        <Link
                          href={`/dashboard/ai-screening?jobId=${job._id}`}
                          className="rounded-lg bg-[#3b82f6] px-2.5 py-2 text-xs font-medium text-white hover:bg-[#2563eb] shadow-sm sm:px-3 sm:text-sm"
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

        <div className="flex flex-col gap-6">
          {jobsLoading ? (
            <>
              {/* Shimmer for Overview Chart */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-md p-4 sm:p-6 animate-pulse h-[340px]">
                <div className="flex items-center gap-2 mb-8">
                  <div className="h-6 w-6 rounded bg-gray-200"></div>
                  <div className="h-6 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="h-48 w-full bg-gray-100 rounded-lg"></div>
              </div>
              
              {/* Shimmer for Recent Activity */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-md p-4 sm:p-6 animate-pulse h-[320px]">
                <div className="h-6 w-40 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex min-w-0 items-start gap-4">
                      <div className="h-9 w-9 shrink-0 rounded-lg bg-gray-200"></div>
                      <div className="w-full">
                        <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <OverviewChart jobs={jobs} />
              <div className="mt-0">
                <RecentActivity jobs={jobs} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}