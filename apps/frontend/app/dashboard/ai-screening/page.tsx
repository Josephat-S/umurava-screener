"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import { Award, ChevronDown, Trash2 } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ScreenedCandidateCard from "../_components/ScreenedCandidateCard";
import ScreeningActionButton from "../_components/ScreeningActionButton";
import { fetchApplicants } from "@/store/slices/applicantSlice";
import { fetchJobs } from "@/store/slices/jobSlice";
import {
  clearStoredScreeningResults,
  fetchScreeningResults,
} from "@/store/slices/screeningSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AIScreeningPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 bg-gray-50 min-h-screen">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-16 text-center text-gray-400">
            Loading screening view...
          </div>
        </div>
      }
    >
      <AIScreeningPageContent />
    </Suspense>
  );
}

function AIScreeningPageContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const { jobs, loading: jobsLoading } = useAppSelector((state) => state.jobs);
  const { applicants } = useAppSelector((state) => state.applicants);
  const { result, shortlist, screening, loading, clearing, error } = useAppSelector(
    (state) => state.screening,
  );

  const [selectedJobId, setSelectedJobId] = useState("");

  useEffect(() => {
    void dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    if (selectedJobId || jobs.length === 0) {
      return;
    }

    const queryJobId = searchParams.get("jobId");
    const jobExists = jobs.some((job) => job._id === queryJobId);
    setSelectedJobId(jobExists && queryJobId ? queryJobId : jobs[0]._id);
  }, [jobs, searchParams, selectedJobId]);

  useEffect(() => {
    if (!selectedJobId) {
      return;
    }

    void dispatch(fetchApplicants(selectedJobId));
    void dispatch(fetchScreeningResults(selectedJobId));
  }, [dispatch, selectedJobId]);

  const selectedJob = jobs.find((job) => job._id === selectedJobId) || null;
  const totalApplicants = result?.totalApplicants || applicants.length;
  const hasApplicants = applicants.length > 0;

  const recommendationSummary = useMemo(() => {
    if (shortlist.length === 0) {
      return { strong: 0, moderate: 0, weak: 0 };
    }

    return shortlist.reduce(
      (accumulator, candidate) => {
        if (candidate.matchScore >= 70) {
          accumulator.strong += 1;
        } else if (candidate.matchScore >= 40) {
          accumulator.moderate += 1;
        } else {
          accumulator.weak += 1;
        }

        return accumulator;
      },
      { strong: 0, moderate: 0, weak: 0 },
    );
  }, [shortlist]);

  const handleClear = async () => {
    if (!selectedJobId) {
      return;
    }

    try {
      await dispatch(clearStoredScreeningResults(selectedJobId)).unwrap();
      toast.success("Stored screening results cleared.");
    } catch (clearError) {
      toast.error((clearError as Error).message || "Failed to clear results");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI Screening</h1>
          <p className="text-gray-500 text-sm mt-1">
            Run AI-powered candidate evaluation and ranking.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative min-w-64">
            <select
              value={selectedJobId}
              onChange={(event) => setSelectedJobId(event.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full"
            >
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <ScreeningActionButton jobId={selectedJobId} disabled={!selectedJobId || !hasApplicants} />

          <button
            type="button"
            onClick={handleClear}
            disabled={!result || clearing}
            className="flex items-center justify-center gap-2 border border-gray-200 bg-white px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-white transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear Results
          </button>
        </div>
      </div>

      {jobsLoading ? (
        <div className="rounded-xl border border-gray-100 bg-white px-6 py-14 text-center shadow-sm text-gray-400">
          Loading jobs...
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
          <p className="text-lg font-medium text-gray-700">No jobs available yet.</p>
          <p className="text-sm text-gray-400 mt-2">
            Create a job posting before you try to run AI screening.
          </p>
          <Link
            href="/dashboard/job-postings"
            className="inline-flex mt-5 rounded-lg bg-[#260af5] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a05cc]"
          >
            Create Job Posting
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <p className="text-sm text-gray-500">Selected Role</p>
              <p className="mt-2 text-lg font-bold text-gray-800">
                {selectedJob?.title || "Choose a role"}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {selectedJob?.experienceYears || 0}+ years • {selectedJob?.educationLevel || "No education level"}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <p className="text-sm text-gray-500">Applicant Pool</p>
              <p className="mt-2 text-3xl font-bold text-gray-800">{totalApplicants}</p>
              <p className="text-xs text-gray-400 mt-2">
                {hasApplicants
                  ? "Applicants ready for evaluation"
                  : "Add applicants before running screening"}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <p className="text-sm text-gray-500">Shortlist Snapshot</p>
              <p className="mt-2 text-3xl font-bold text-gray-800">{shortlist.length}</p>
              <p className="text-xs text-gray-400 mt-2">
                {recommendationSummary.strong} strong • {recommendationSummary.moderate} moderate • {recommendationSummary.weak} weak
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {screening && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center mb-6">
              <div className="mx-auto h-12 w-12 rounded-full bg-white text-[#260af5] flex items-center justify-center text-lg font-bold shadow-sm">
                AI
              </div>
              <p className="text-blue-700 font-semibold text-lg mt-4">
                AI is screening candidates...
              </p>
              <p className="text-blue-500 text-sm mt-1">
                This may take up to 30 seconds depending on applicant count.
              </p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#260af5]" />
                <h2 className="text-lg font-bold text-gray-800">Ranked Candidates</h2>
              </div>
              {result?.processedAt && (
                <p className="text-sm text-gray-400">
                  Last processed {formatDate(result.processedAt)}
                </p>
              )}
            </div>

            <div className="p-6">
              {loading ? (
                <div className="py-16 text-center text-gray-400">
                  Loading screening results...
                </div>
              ) : shortlist.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-lg font-medium text-gray-700">
                    No screening results yet.
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {hasApplicants
                      ? "Run AI screening to generate a ranked shortlist with reasoning."
                      : "Add applicants to this role before running screening."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shortlist.map((candidate) => (
                    <ScreenedCandidateCard
                      key={candidate.candidateId}
                      candidate={candidate}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
