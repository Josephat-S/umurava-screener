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
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import ComparisonView from "../_components/ComparisonView";
import EmptyState from "../_components/EmptyState";
import ExportButton from "../_components/ExportButton";
import KanbanBoard from "../_components/KanbanBoard";
import ScreenedCandidateCard from "../_components/ScreenedCandidateCard";
import ScreeningHistory from "../_components/ScreeningHistory";
import ScreeningProgress from "../_components/ScreeningProgress";
import ScreeningSummary from "../_components/ScreeningSummary";
import WeightsSlider from "../_components/WeightsSlider";
import EmailModal from "../_components/EmailModal";
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
import type { CandidateStatus, ScoredCandidate } from "@/types";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function truncateSelectLabel(value: string, maxLength = 48): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}...`;
}

export default function AIScreeningPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto min-h-screen w-full max-w-6xl overflow-x-hidden bg-gray-200 px-2 py-2 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:pr-8 2xl:pr-10 animate-pulse">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="h-8 w-48 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 w-64 bg-gray-300 rounded"></div>
            </div>
            <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-end md:gap-3">
              <div className="h-10 w-full md:w-64 bg-gray-300 rounded-lg"></div>
              <div className="h-10 w-full md:w-32 bg-gray-300 rounded-lg"></div>
              <div className="h-10 w-full md:w-32 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-4 mb-6">
            <div className="h-28 bg-gray-300 rounded-xl"></div>
            <div className="h-28 bg-gray-300 rounded-xl"></div>
            <div className="h-28 bg-gray-300 rounded-xl"></div>
          </div>
          <div className="h-32 bg-gray-300 rounded-xl mb-6"></div>
          <div className="h-[400px] bg-gray-300 rounded-xl"></div>
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
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedComparisonIds, setSelectedComparisonIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [emailCandidate, setEmailCandidate] = useState<ScoredCandidate | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    void dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="mx-auto min-h-screen w-full max-w-6xl overflow-x-hidden bg-gray-200 px-2 py-2 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:pr-8 2xl:pr-10">
      <div className="mb-3 flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 max-w-2xl">
          <h1 className="text-[1.25rem] font-bold leading-tight text-[#3b82f6] sm:text-[1.75rem]">
            AI Screening
          </h1>
          <p className="mt-1 max-w-xl break-words [overflow-wrap:anywhere] text-[11px] leading-5 text-gray-500 sm:text-sm sm:leading-6">
            Tune the rubric, run the AI, compare finalists, and move candidates through hiring stages.
          </p>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2 md:flex-row md:items-center md:justify-end md:gap-3">
          <div
            ref={dropdownRef}
            className="relative w-full min-w-0 md:w-auto md:min-w-64 lg:min-w-72"
          >
            <button
              type="button"
              onClick={() => setIsDropdownOpen((previous) => !previous)}
              className="block w-full min-w-0 max-w-full truncate rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-10 text-left text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {truncateSelectLabel(selectedJob?.title || "Select a role")}
            </button>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {jobs.map((job) => (
                  <button
                    key={job._id}
                    type="button"
                    onClick={() => {
                      setSelectedJobId(job._id);
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full truncate px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    {truncateSelectLabel(job.title)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleRunScreening}
            disabled={!!(screening || !activeJobId || !hasApplicants || weightsTotal !== 100)}
            className="inline-flex w-full min-h-10 items-center justify-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:bg-[#3b82f6]/50 disabled:text-white md:w-auto sm:px-5 sm:py-2.5 sm:text-sm"
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
            disabled={!!(!result || clearing)}
            className="inline-flex w-full min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 md:w-auto sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <Trash2 className="h-4 w-4" />
            Clear Results
          </button>
        </div>
      </div>

      {jobsLoading ? (
        <div className="min-w-0 max-w-full space-y-6 animate-pulse">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-4">
            <div className="min-h-28 rounded-xl bg-gray-300 shadow-sm"></div>
            <div className="min-h-28 rounded-xl bg-gray-300 shadow-sm"></div>
            <div className="min-h-28 rounded-xl bg-gray-300 shadow-sm"></div>
          </div>
          <div className="h-32 rounded-xl bg-gray-300 shadow-sm"></div>
          <div className="h-[400px] rounded-xl bg-gray-300 shadow-sm"></div>
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
        <div className="min-w-0 max-w-full space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-md">
              {error}
            </div>
          )}

          {!mounted ? (
            <div className="h-96 w-full animate-pulse rounded-xl bg-gray-100" />
          ) : (
            <>
              <div className="min-w-0 max-w-full grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-4">
            {/* Card 1: Primary Blue Focus */}
            <div className="min-w-0 min-h-28 rounded-xl border border-[#3b82f6] bg-[#3b82f6] p-3 shadow-md text-white sm:p-6">
              <p className="text-[11px] font-medium text-blue-100 sm:text-sm">Selected Role</p>
              <p className="mt-2 break-words [overflow-wrap:anywhere] text-sm font-bold leading-tight text-white sm:text-xl">
                {selectedJob?.title || "Choose a role"}
              </p>
              <p className="mt-1 break-words [overflow-wrap:anywhere] text-[10px] leading-4 text-blue-100 sm:mt-2 sm:text-xs">
                {selectedJob?.experienceYears || 0}+ years • {selectedJob?.educationLevel || "No education level"}
              </p>
            </div>

            {/* Card 2: Default White */}
            <div className="min-w-0 min-h-28 rounded-xl border border-gray-100 bg-white p-3 shadow-md sm:p-6">
              <p className="text-[11px] text-gray-500 sm:text-sm">Applicant Pool</p>
              <p className="mt-1 text-xl font-bold text-gray-800 sm:mt-2 sm:text-3xl">{totalApplicants}</p>
              <p className="mt-1 text-[10px] leading-4 text-gray-400 sm:mt-2 sm:text-xs">
                {hasApplicants
                  ? "Applicants ready for AI evaluation"
                  : "Add applicants before screening"}
              </p>
            </div>

            {/* Card 3: Primary Blue Focus */}
            <div className="min-w-0 min-h-28 rounded-xl border border-[#3b82f6] bg-[#3b82f6] p-3 shadow-md text-white sm:p-6">
              <p className="text-[11px] font-medium text-blue-100 sm:text-sm">Shortlist Snapshot</p>
              <p className="mt-1 text-xl font-bold text-white sm:mt-2 sm:text-3xl">{shortlist.length}</p>
              <p className="mt-1 break-words [overflow-wrap:anywhere] text-[10px] leading-4 text-blue-100 sm:mt-2 sm:text-xs">
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

          <div className="min-w-0 max-w-full rounded-xl border border-gray-100 bg-white shadow-md">
            <div className="flex min-w-0 max-w-full flex-col gap-2 border-b border-gray-100 p-3 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <Award className="h-5 w-5 text-[#3b82f6]" />
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[#3b82f6] sm:text-lg">Ranked Candidates</h2>
                  <p className="mt-1 break-words [overflow-wrap:anywhere] text-[11px] text-gray-500 sm:text-sm">
                    Compare finalists and export recruiter-ready shortlist outputs.
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                {selectedCandidates.length >= 2 && (
                  <button
                    type="button"
                    onClick={() => setIsComparing(true)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563eb] shadow-sm sm:w-auto"
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
                  <p className="break-words [overflow-wrap:anywhere] text-sm text-gray-400">
                    Last processed {formatDate(result.processedAt)}
                  </p>
                )}
              </div>
            </div>

            <div className="min-w-0 max-w-full p-3 sm:p-6">
              {loading ? (
                <div className="min-w-0 max-w-full space-y-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="h-12 w-12 rounded-full bg-gray-200 shrink-0"></div>
                        <div className="flex-1 w-full">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                            <div>
                              <div className="h-5 w-48 bg-gray-200 rounded mb-2"></div>
                              <div className="h-4 w-32 bg-gray-200 rounded"></div>
                            </div>
                            <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                            <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                          </div>
                          <div className="mt-4 space-y-2">
                            <div className="h-3 w-full bg-gray-200 rounded"></div>
                            <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                <div className="min-w-0 max-w-full space-y-4">
                  {shortlist.map((candidate) => (
                    <ScreenedCandidateCard
                      key={candidate.candidateId}
                      candidate={candidate}
                      selectable
                      selected={selectedComparisonIds.includes(candidate.candidateId)}
                      onToggleSelection={toggleCandidateSelection}
                      onEmail={() => setEmailCandidate(candidate)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {shortlist.length > 0 && (
            <div className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-md">
              <div className="mb-5 flex items-start gap-2">
                <Columns3 className="h-5 w-5 text-[#3b82f6]" />
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-[#3b82f6]">Hiring Workflow Board</h2>
                  <p className="mt-1 break-words [overflow-wrap:anywhere] text-sm text-gray-500">
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
            </>
          )}
        </div>
      )}

      {isComparing && selectedCandidates.length >= 2 && (
        <ComparisonView
          jobId={activeJobId}
          candidates={selectedCandidates}
          onClose={() => setIsComparing(false)}
        />
      )}

      {emailCandidate && (
        <EmailModal
          jobId={activeJobId}
          candidate={emailCandidate}
          jobTitle={selectedJob?.title || "Role"}
          onClose={() => setEmailCandidate(null)}
        />
      )}
    </div>
  );
}