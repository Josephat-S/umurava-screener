"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Briefcase, MapPin, TrendingUp, Users } from "lucide-react";
import RecentActivity from "./_components/RecentActivity";
import StatCard from "./_components/StatCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
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

  useEffect(() => {
    void dispatch(fetchJobs());
  }, [dispatch]);

  const stats = useMemo(() => {
    const shortlistCapacity = jobs.reduce((sum, job) => sum + job.shortlistSize, 0);
    const avgExperience = jobs.length
      ? `${Math.round(
          jobs.reduce((sum, job) => sum + job.experienceYears, 0) / jobs.length,
        )} yrs`
      : "—";
    const jobsWithLocation = jobs.filter((job) => Boolean(job.location)).length;

    return {
      totalJobs: jobs.length,
      shortlistCapacity,
      avgExperience,
      jobsWithLocation,
    };
  }, [jobs]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage jobs, applicants, and screening decisions from one place.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/candidates"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Candidates
          </Link>
          <Link
            href="/dashboard/job-postings"
            className="px-5 py-2 text-sm font-medium text-white bg-[#260af5] rounded-lg hover:bg-[#1a05cc] transition-colors"
          >
            Create Job
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Active Jobs"
          value={stats.totalJobs}
          subtext="Open roles currently configured"
          icon={<Briefcase size={20} />}
          iconBgColor="bg-[#260af5]"
        />
        <StatCard
          title="Shortlist Capacity"
          value={stats.shortlistCapacity}
          subtext="Total top-candidate slots configured"
          icon={<Users size={20} />}
          iconBgColor="bg-blue-500"
        />
        <StatCard
          title="Avg. Experience"
          value={stats.avgExperience}
          subtext="Average experience requirement across jobs"
          icon={<TrendingUp size={20} />}
          iconBgColor="bg-green-500"
        />
        <StatCard
          title="Locations Set"
          value={stats.jobsWithLocation}
          subtext="Jobs with a location configured"
          icon={<MapPin size={20} />}
          iconBgColor="bg-yellow-500"
        />
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Recent Job Postings</h2>
              <p className="text-sm text-gray-500 mt-1">
                Your latest roles ready for applicants and screening.
              </p>
            </div>
            <Link
              href="/dashboard/job-postings"
              className="text-sm font-medium text-[#260af5] hover:text-[#1a05cc]"
            >
              Manage Jobs
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
              <p className="text-base font-medium text-gray-700">No jobs yet.</p>
              <p className="text-sm text-gray-400 mt-2">
                Create your first role to start collecting candidates.
              </p>
              <Link
                href="/dashboard/job-postings"
                className="inline-flex mt-5 rounded-lg bg-[#260af5] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a05cc] transition-colors"
              >
                Create a Job
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.slice(0, 4).map((job) => (
                <article
                  key={job._id}
                  className="rounded-xl border border-gray-100 bg-gray-50/70 p-5"
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
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Candidates
                        </Link>
                        <Link
                          href={`/dashboard/ai-screening?jobId=${job._id}`}
                          className="rounded-lg bg-[#260af5] px-3 py-2 text-sm font-medium text-white hover:bg-[#1a05cc]"
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
