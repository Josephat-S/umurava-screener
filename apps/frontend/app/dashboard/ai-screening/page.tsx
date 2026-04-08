"use client";

import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  Award,
  Briefcase,
  ChevronDown,
  Columns3,
  GitCompareArrows,
  Trash2,
  Users,
} from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import ComparisonView from "../_components/ComparisonView";
import EmptyState from "../_components/EmptyState";
import ExportButton from "../_components/ExportButton";
import KanbanBoard from "../_components/KanbanBoard";
import ScreenedCandidateCard from "../_components/ScreenedCandidateCard";
import ScreeningHistory from "../_components/ScreeningHistory";
import ScreeningProgress from "../_components/ScreeningProgress";
import ScreeningSummary from "../_components/ScreeningSummary";
import WeightsSlider from "../_components/WeightsSlider";
import { fetchApplicants } from "@/store/slices/applicantSlice";
import { fetchJobs } from "@/store/slices/jobSlice";
import {
  DEFAULT_SCORING_WEIGHTS,
  clearStoredScreeningResults,
  fetchScreeningResults,
  resetWeightsForJob,
  setWeightsForJob,
  triggerScreening,
  updateScreeningCandidateStatus,
} from "@/store/slices/screeningSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { CandidateStatus } from "@/types";

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
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="rounded-xl border border-gray-100 bg-white px-6 py-16 text-center text-gray-400 shadow-md">
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
  const {
    result,
    shortlist,
    screening,
    loading,
    clearing,
    updatingCandidateId,
    weightsByJobId,
    error,
  } = useAppSelector((state) => state.screening);

  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedComparisonIds, setSelectedComparisonIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    void dispatch(fetchJobs());
  }, [dispatch]);

  const queryJobId = searchParams.get("jobId");
  const defaultJobId = useMemo(() => {
    if (jobs.length === 0) {
      return "";
    }

    const matchingQueryJobId = queryJobId
      ? jobs.find((job) => job._id === queryJobId)?._id
      : "";

    return matchingQueryJobId || jobs[0]._id;
  }, [jobs, queryJobId]);

  const activeJobId = jobs.some((job) => job._id === selectedJobId)
    ? selectedJobId
    : defaultJobId;

  useEffect(() => {
    if (!activeJobId) {
      return;
    }

    void dispatch(fetchApplicants(activeJobId));
    void dispatch(fetchScreeningResults(activeJobId));
  }, [activeJobId, dispatch]);

  const selectedJob = jobs.find((job) => job._id === activeJobId) || null;
  const totalApplicants = result?.totalApplicants || applicants.length;
  const hasApplicants = applicants.length > 0;
  const currentWeights = weightsByJobId[activeJobId] || DEFAULT_SCORING_WEIGHTS;
  const weightsTotal = Object.values(currentWeights).reduce(
    (sum, value) => sum + value,
    0,
  );

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

  const selectedCandidates = shortlist.filter((candidate) =>
    selectedComparisonIds.includes(candidate.candidateId),
  );

  const handleRunScreening = async () => {
    if (!activeJobId) {
      return;
    }

    if (!hasApplicants) {
      toast.error("Add applicants before running screening.");
      return;
    }

    if (weightsTotal !== 100) {
      toast.error("Scoring weights must total 100% before screening can run.");
      return;
    }

    try {
      await dispatch(triggerScreening(activeJobId)).unwrap();
      await dispatch(fetchScreeningResults(activeJobId)).unwrap();
      setSelectedComparisonIds([]);
      toast.success("AI screening complete. The shortlist is ready.");
    } catch (runError) {
      toast.error((runError as Error).message || "Screening failed");
    }
  };

  const handleClear = async () => {
    if (!activeJobId) {
      return;
    }

    try {
      await dispatch(clearStoredScreeningResults(activeJobId)).unwrap();
      setSelectedComparisonIds([]);
      setIsComparing(false);
      toast.success("Stored screening results cleared.");
    } catch (clearError) {
      toast.error((clearError as Error).message || "Failed to clear results");
    }
  };

  const handleMoveCandidateStatus = async (
    candidateId: string,
    status: CandidateStatus,
  ) => {
    if (!activeJobId) {
      return;
    }

    try {
      await dispatch(
        updateScreeningCandidateStatus({ jobId: activeJobId, candidateId, status }),
      ).unwrap();
      toast.success("Candidate status updated.");
    } catch (statusError) {
      toast.error((statusError as Error).message || "Failed to update candidate status");
    }
  };

  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedComparisonIds((previous) =>
      previous.includes(candidateId)
        ? previous.filter((item) => item !== candidateId)
        : [...previous, candidateId].slice(-3),
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3b82f6]">AI Screening</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tune the rubric, run the AI, compare finalists, and move candidates through hiring stages.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative min-w-0 md:min-w-72">
            <select
              value={activeJobId}
              onChange={(event) => setSelectedJobId(event.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            >
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          <button
            type="button"
            onClick={handleRunScreening}
            disabled={screening || !activeJobId || !hasApplicants || weightsTotal !== 100}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3b82f6] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:bg-[#3b82f6]/40"
          >
            {screening ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Screening...
              </>
            ) : (
              <>
                <Award className="h-4 w-4" />
                Run AI Screening
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={!result || clearing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
            Clear Results
          </button>
        </div>
      </div>

      {jobsLoading ? (
        <div className="rounded-xl border border-gray-100 bg-white px-6 py-14 text-center text-gray-400 shadow-md">
          Loading jobs...
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-6 w-6" />}
          title="No jobs available yet"
          description="Create a job posting first so the AI has a role to screen candidates against."
          actionLabel="Create Job Posting"
          actionHref="/dashboard/job-postings"
        />
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-md">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            {/* Card 1: Primary Blue Focus */}
            <div className="rounded-xl border border-[#3b82f6] bg-[#3b82f6] p-6 shadow-md text-white">
              <p className="text-sm font-medium text-blue-100">Selected Role</p>
              <p className="mt-2 text-lg font-bold text-white">
                {selectedJob?.title || "Choose a role"}
              </p>
              <p className="mt-2 text-xs text-blue-100">
                {selectedJob?.experienceYears || 0}+ years • {selectedJob?.educationLevel || "No education level"}
              </p>
            </div>

            {/* Card 2: Default White */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-md">
              <p className="text-sm text-gray-500">Applicant Pool</p>
              <p className="mt-2 text-3xl font-bold text-gray-800">{totalApplicants}</p>
              <p className="mt-2 text-xs text-gray-400">
                {hasApplicants
                  ? "Applicants ready for AI evaluation"
                  : "Add applicants before screening"}
              </p>
            </div>

            {/* Card 3: Primary Blue Focus */}
            <div className="rounded-xl border border-[#3b82f6] bg-[#3b82f6] p-6 shadow-md text-white">
              <p className="text-sm font-medium text-blue-100">Shortlist Snapshot</p>
              <p className="mt-2 text-3xl font-bold text-white">{shortlist.length}</p>
              <p className="mt-2 text-xs text-blue-100">
                {recommendationSummary.strong} strong • {recommendationSummary.moderate} moderate • {recommendationSummary.weak} weak
              </p>
            </div>
          </div>

          <WeightsSlider
            weights={currentWeights}
            onChange={(weights) => {
              if (!activeJobId) {
                return;
              }

              dispatch(setWeightsForJob({ jobId: activeJobId, weights }));
            }}
            onReset={() => {
              if (!activeJobId) {
                return;
              }

              dispatch(resetWeightsForJob(activeJobId));
            }}
          />

          {screening && <ScreeningProgress />}

          {result && shortlist.length > 0 && (
            <ScreeningSummary result={result} shortlist={shortlist} />
          )}

          <ScreeningHistory
            result={result}
            screening={screening}
            onRerun={handleRunScreening}
          />

          <div className="rounded-xl border border-gray-100 bg-white shadow-md">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#3b82f6]" />
                <div>
                  <h2 className="text-lg font-bold text-[#3b82f6]">Ranked Candidates</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Compare finalists and export recruiter-ready shortlist outputs.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedCandidates.length >= 2 && (
                  <button
                    type="button"
                    onClick={() => setIsComparing(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563eb] shadow-sm"
                  >
                    <GitCompareArrows className="h-4 w-4" />
                    Compare {selectedCandidates.length}
                  </button>
                )}
                <ExportButton
                  shortlist={shortlist}
                  jobTitle={selectedJob?.title || "screening"}
                />
                {result?.processedAt && (
                  <p className="text-sm text-gray-400">
                    Last processed {formatDate(result.processedAt)}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="py-16 text-center text-gray-400">
                  Loading screening results...
                </div>
              ) : shortlist.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-6 w-6" />}
                  title={hasApplicants ? "Ready to screen" : "No applicants yet"}
                  description={
                    hasApplicants
                      ? "Run AI screening to generate a ranked shortlist with explanations, comparison, and export tools."
                      : "Upload applicants or add structured candidates before running the AI screening workflow."
                  }
                  actionLabel={hasApplicants ? undefined : "Manage Candidates"}
                  actionHref={hasApplicants ? undefined : `/dashboard/candidates?jobId=${activeJobId}`}
                />
              ) : (
                <div className="space-y-4">
                  {shortlist.map((candidate) => (
                    <ScreenedCandidateCard
                      key={candidate.candidateId}
                      candidate={candidate}
                      selectable
                      selected={selectedComparisonIds.includes(candidate.candidateId)}
                      onToggleSelection={toggleCandidateSelection}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {shortlist.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-md">
              <div className="mb-5 flex items-center gap-2">
                <Columns3 className="h-5 w-5 text-[#3b82f6]" />
                <div>
                  <h2 className="text-lg font-bold text-[#3b82f6]">Hiring Workflow Board</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Move candidates from shortlist to interview, offer, hired, or rejected.
                  </p>
                </div>
              </div>

              <KanbanBoard
                shortlist={shortlist}
                updatingCandidateId={updatingCandidateId}
                onMove={handleMoveCandidateStatus}
              />
            </div>
          )}
        </div>
      )}

      {isComparing && selectedCandidates.length >= 2 && (
        <ComparisonView
          candidates={selectedCandidates}
          onClose={() => setIsComparing(false)}
        />
      )}
    </div>
  );
}