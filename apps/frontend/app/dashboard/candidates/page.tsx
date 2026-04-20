"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Link2,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  addStructuredApplicants,
  clearApplicantsForJob,
  deleteApplicant,
  fetchApplicants,
  uploadApplicantFiles,
} from "@/store/slices/applicantSlice";
import { fetchJobs } from "@/store/slices/jobSlice";
import { fetchScreeningResults } from "@/store/slices/screeningSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { Applicant, StructuredApplicantInput } from "@/types";

const INITIAL_APPLICANT_FORM: StructuredApplicantInput = {
  name: "",
  email: "",
  skills: [],
  experienceYears: 0,
  education: "",
  currentRole: "",
  summary: "",
};

const APPLICANTS_PER_PAGE = 10;
const MAX_UPLOAD_FILES = 50;

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getScoreColor(score?: number): string {
  if (typeof score !== "number") return "text-gray-400";
  if (score >= 80) return "text-green-500 font-medium";
  if (score >= 70) return "text-orange-500 font-medium";
  return "text-gray-800";
}

function truncateSelectLabel(value: string, maxLength = 30): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}...`;
}

function StatusBadge({ status }: { status: "Screened" | "Parsed" | "New" }) {
  switch (status) {
    case "Screened":
      return (
        <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded-full text-xs font-medium">
          Screened
        </span>
      );
    case "Parsed":
      return (
        <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-medium">
          Parsed
        </span>
      );
    default:
      return (
        <span className="px-3 py-1 bg-gray-50 text-gray-500 border border-gray-200 rounded-full text-xs font-medium">
          New
        </span>
      );
  }
}

export default function CandidatesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-200 p-4 sm:p-6 lg:p-8 animate-pulse">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="h-8 w-48 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 w-64 bg-gray-300 rounded"></div>
            </div>
            <div className="h-10 w-full sm:w-64 bg-gray-300 rounded-lg"></div>
          </div>
          <div className="w-full h-24 bg-gray-300 rounded-xl mb-6"></div>
          <div className="w-full h-96 bg-gray-300 rounded-xl"></div>
        </div>
      }
    >
      <CandidatesPageContent />
    </Suspense>
  );
}

function CandidatesPageContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { jobs, loading: jobsLoading } = useAppSelector((state) => state.jobs);
  const {
    applicants,
    loading,
    uploading,
    adding,
    deletingApplicantId,
    clearingJobId,
    error,
  } = useAppSelector((state) => state.applicants);
  const shortlist = useAppSelector((state) => state.screening.shortlist);

  const [activeTab, setActiveTab] = useState<"structured" | "external">("structured");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [paginationState, setPaginationState] = useState({
    key: "",
    page: 1,
  });
  const [skillsInput, setSkillsInput] = useState("");
  const [resumeLinksInput, setResumeLinksInput] = useState("");
  const [latestImport, setLatestImport] = useState<{
    jobId: string;
    count: number;
  } | null>(null);
  const [structuredForm, setStructuredForm] =
    useState<StructuredApplicantInput>(INITIAL_APPLICANT_FORM);

  useEffect(() => {
    void dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

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
  const totalJobApplicants = applicants.length;
  const structuredApplicantsCount = applicants.filter(
    (applicant) => applicant.source === "platform",
  ).length;
  const uploadedApplicantsCount = applicants.filter(
    (applicant) => applicant.source === "upload",
  ).length;

  const screeningMap = useMemo(
    () =>
      new Map(shortlist.map((candidate) => [candidate.candidateId, candidate.matchScore])),
    [shortlist],
  );

  const filteredApplicants = useMemo(() => {
    const sourceType = activeTab === "structured" ? "platform" : "upload";

    return applicants
      .filter((applicant) => applicant.source === sourceType)
      .filter((applicant) => {
        const haystack = [
          applicant.name,
          applicant.email,
          applicant.currentRole || "",
          applicant.education,
          applicant.skills.join(" "),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(deferredSearch.toLowerCase());
      });
  }, [activeTab, applicants, deferredSearch]);

  const shouldPaginate = true;
  const totalFilteredApplicants = filteredApplicants.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalFilteredApplicants / APPLICANTS_PER_PAGE),
  );
  const currentViewLabel =
    activeTab === "structured" ? "structured applicants" : "uploaded applicants";
  const paginationKey = `${activeTab}:${activeJobId}:${deferredSearch.toLowerCase()}`;
  const currentPage =
    paginationState.key === paginationKey ? paginationState.page : 1;
  const normalizedCurrentPage = Math.min(currentPage, totalPages);

  const visibleApplicants = useMemo(() => {
    if (!shouldPaginate) {
      return filteredApplicants;
    }

    const startIndex = (normalizedCurrentPage - 1) * APPLICANTS_PER_PAGE;
    return filteredApplicants.slice(
      startIndex,
      startIndex + APPLICANTS_PER_PAGE,
    );
  }, [filteredApplicants, normalizedCurrentPage, shouldPaginate]);

  const pageStart = shouldPaginate
    ? totalFilteredApplicants === 0
      ? 0
      : (normalizedCurrentPage - 1) * APPLICANTS_PER_PAGE + 1
    : 0;
  const pageEnd = shouldPaginate
    ? Math.min(
        normalizedCurrentPage * APPLICANTS_PER_PAGE,
        totalFilteredApplicants,
      )
    : 0;

  const addSkill = () => {
    const value = skillsInput.trim();
    if (!value) return;

    setStructuredForm((previous) => ({
      ...previous,
      skills: Array.from(new Set([...previous.skills, value])),
    }));
    setSkillsInput("");
  };

  const removeSkill = (skill: string) => {
    setStructuredForm((previous) => ({
      ...previous,
      skills: previous.skills.filter((item) => item !== skill),
    }));
  };

  const handleStructuredSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeJobId) {
      toast.error("Select a job before adding applicants.");
      return;
    }

    try {
      const applicantPayload = {
        ...structuredForm,
        currentRole: structuredForm.currentRole || undefined,
        summary: structuredForm.summary || undefined,
      };

      await dispatch(
        addStructuredApplicants({
          jobId: activeJobId,
          applicants: [applicantPayload],
        }),
      ).unwrap();
      toast.success("Applicant added successfully.");
      setStructuredForm(INITIAL_APPLICANT_FORM);
      setSkillsInput("");
      setPaginationState({ key: paginationKey, page: 1 });
      setIsAddModalOpen(false); // Close the modal on success
    } catch (submitError) {
      toast.error((submitError as Error).message || "Failed to add applicant");
    }
  };

  const handleUploadSubmission = async ({
    files,
    resumeLinks = [],
  }: {
    files?: FileList | null;
    resumeLinks?: string[];
  }) => {
    if (!activeJobId) {
      toast.error("Select a job before importing applicants.");
      return;
    }

    const filePayload = files ? Array.from(files) : [];

    if (filePayload.length === 0 && resumeLinks.length === 0) {
      return;
    }

    try {
      const result = await dispatch(
        uploadApplicantFiles({
          jobId: activeJobId,
          files: filePayload,
          resumeLinks,
        }),
      ).unwrap();
      setPaginationState({ key: paginationKey, page: 1 });
      setLatestImport({
        jobId: activeJobId,
        count: result.length,
      });
      if (resumeLinks.length > 0) {
        setResumeLinksInput("");
      }
      toast.success(
        `${result.length} applicants imported to ${selectedJob?.title || "the selected job"}.`,
      );
    } catch (uploadError) {
      toast.error((uploadError as Error).message || "Import failed");
    }
  };

  const handleResumeLinkUpload = async () => {
    const resumeLinks = Array.from(
      new Set(
        resumeLinksInput
          .split("\n")
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    );

    if (resumeLinks.length === 0) {
      toast.error("Paste at least one resume link before importing.");
      return;
    }

    await handleUploadSubmission({ resumeLinks });
  };

  const handleDeleteApplicant = async (applicant: Applicant) => {
    if (!activeJobId) {
      return;
    }

    const shouldDelete = window.confirm(
      `Delete ${applicant.name} from ${selectedJob?.title || "this job"}?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await dispatch(
        deleteApplicant({ jobId: activeJobId, applicantId: applicant._id }),
      ).unwrap();
      await dispatch(fetchScreeningResults(activeJobId)).unwrap();
      toast.success("Applicant deleted successfully.");
    } catch (deleteError) {
      toast.error((deleteError as Error).message || "Failed to delete applicant");
    }
  };

  const handleClearApplicants = async () => {
    if (!activeJobId) {
      return;
    }

    if (totalJobApplicants === 0) {
      toast.error("There are no applicants to delete for this job.");
      return;
    }

    const shouldClear = window.confirm(
      `Delete all ${totalJobApplicants} applicants from ${selectedJob?.title || "this job"}? This cannot be undone.`,
    );

    if (!shouldClear) {
      return;
    }

    try {
      const deletedCount = await dispatch(clearApplicantsForJob(activeJobId)).unwrap();
      await dispatch(fetchScreeningResults(activeJobId)).unwrap();
      setPaginationState({ key: paginationKey, page: 1 });
      setLatestImport((previous) =>
        previous?.jobId === activeJobId ? null : previous,
      );
      toast.success(
        deletedCount > 0
          ? `${deletedCount} applicants deleted from ${selectedJob?.title || "the selected job"}.`
          : "No applicants were deleted.",
      );
    } catch (clearError) {
      toast.error((clearError as Error).message || "Failed to clear applicants");
    }
  };

  const renderTableSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden animate-pulse">
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
        <div className="h-6 w-48 bg-gray-200 rounded"></div>
        <div className="flex w-full sm:w-auto gap-3">
          <div className="h-9 w-full sm:w-48 md:w-64 bg-gray-200 rounded-lg"></div>
          <div className="h-9 w-full sm:w-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
      
      {/* Mobile Skeleton */}
      <div className="space-y-3 p-4 md:hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-gray-100 p-4">
            <div className="flex justify-between gap-3 mb-3">
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-40 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-10 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2 mb-3">
              <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Skeleton */}
      <div className="hidden w-full overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 pl-6 pr-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></th>
              <th className="py-4 px-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></th>
              <th className="py-4 px-4"><div className="h-4 w-32 bg-gray-200 rounded"></div></th>
              <th className="py-4 px-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></th>
              <th className="py-4 px-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></th>
              <th className="py-4 pl-4 pr-6"><div className="h-4 w-16 bg-gray-200 rounded ml-auto"></div></th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-4 pl-6 pr-4">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-40 bg-gray-200 rounded"></div>
                </td>
                <td className="py-4 px-4"><div className="h-4 w-12 bg-gray-200 rounded"></div></td>
                <td className="py-4 px-4"><div className="h-4 w-48 bg-gray-200 rounded"></div></td>
                <td className="py-4 px-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                <td className="py-4 px-4"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
                <td className="py-4 pl-4 pr-6"><div className="h-8 w-20 bg-gray-200 rounded-lg ml-auto"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTable = (rows: Applicant[]) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden animate-in fade-in duration-300">
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
        <h2 className="min-w-0 break-words text-lg font-bold text-[#3b82f6]">
          {activeTab === "structured" ? "Structured Applicants" : "Uploaded Applicants"}
        </h2>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search candidates..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors w-full sm:w-48 md:w-64 shadow-sm"
            />
          </div>

          <button className="flex w-full items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm sm:w-auto">
            <Filter className="w-4 h-4" />
            {totalFilteredApplicants} Results
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-6 py-16 text-center text-gray-400">
          No applicants in this view yet.
        </div>
      ) : (
        <>
          <div className="space-y-3 p-4 md:hidden">
            {rows.map((applicant) => {
              const score = screeningMap.get(applicant._id);
              const status =
                typeof score === "number"
                  ? "Screened"
                  : applicant.source === "upload"
                    ? "Parsed"
                    : "New";

              return (
                <article
                  key={applicant._id}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-gray-800">{applicant.name}</p>
                      <p className="mt-1 break-all text-xs text-gray-400">{applicant.email}</p>
                    </div>
                    <span className={`shrink-0 text-sm ${getScoreColor(score)}`}>
                      {typeof score === "number" ? `${score}%` : "—"}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs text-gray-600">
                    <p className="break-words">
                      <span className="font-medium text-gray-700">Job:</span> {selectedJob?.title || "Selected job"}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Applied:</span> {formatDate(applicant.createdAt)}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <StatusBadge status={status} />
                    <button
                      type="button"
                      onClick={() => void handleDeleteApplicant(applicant)}
                      disabled={
                        deletingApplicantId === applicant._id ||
                        clearingJobId === activeJobId
                      }
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm sm:w-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingApplicantId === applicant._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden w-full overflow-x-auto md:block">
            <table className="w-full min-w-[640px] text-left border-collapse">
              <thead>
                <tr className="bg-white text-sm text-gray-500 border-b border-gray-100">
                  <th className="py-4 pl-6 pr-4 font-medium">Name</th>
                  <th className="py-4 px-4 font-medium">Match Score</th>
                  <th className="py-4 px-4 font-medium">Job Applied</th>
                  <th className="py-4 px-4 font-medium">Applied Date</th>
                  <th className="py-4 px-4 font-medium">Status</th>
                  <th className="py-4 pl-4 pr-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((applicant) => {
                  const score = screeningMap.get(applicant._id);
                  const status =
                    typeof score === "number"
                      ? "Screened"
                      : applicant.source === "upload"
                        ? "Parsed"
                        : "New";

                  return (
                    <tr
                      key={applicant._id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="py-4 pl-6 pr-4">
                        <div className="min-w-0 max-w-[14rem] sm:max-w-[18rem]">
                          <p className="truncate text-sm font-medium text-gray-800" title={applicant.name}>{applicant.name}</p>
                          <p className="mt-1 truncate text-xs text-gray-400" title={applicant.email}>{applicant.email}</p>
                        </div>
                      </td>
                      <td className={`py-4 px-4 text-sm ${getScoreColor(score)}`}>
                        {typeof score === "number" ? `${score}%` : "—"}
                      </td>
                      <td className="max-w-[12rem] py-4 px-4 text-sm text-gray-600 sm:max-w-[16rem]">
                        <span className="block truncate" title={selectedJob?.title || "Selected job"}>
                          {selectedJob?.title || "Selected job"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {formatDate(applicant.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={status} />
                      </td>
                      <td className="py-4 pl-4 pr-6 text-right">
                        <button
                          type="button"
                          onClick={() => void handleDeleteApplicant(applicant)}
                          disabled={
                            deletingApplicantId === applicant._id ||
                            clearingJobId === activeJobId
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingApplicantId === applicant._id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {shouldPaginate && totalFilteredApplicants > 0 && (
        <div className="flex flex-col gap-4 border-t border-gray-100 px-4 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-500">
            Showing {pageStart}-{pageEnd} of {totalFilteredApplicants} {currentViewLabel}
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <span className="hidden rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium uppercase tracking-wide text-gray-400 sm:inline-flex shadow-sm">
              {APPLICANTS_PER_PAGE} per page
            </span>

            <button
              type="button"
              onClick={() =>
                setPaginationState({
                  key: paginationKey,
                  page: Math.max(normalizedCurrentPage - 1, 1),
                })
              }
              disabled={normalizedCurrentPage === 1}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="rounded-lg border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700 shadow-sm">
              Page {normalizedCurrentPage} of {totalPages}
            </div>

            <button
              type="button"
              onClick={() =>
                setPaginationState({
                  key: paginationKey,
                  page: Math.min(normalizedCurrentPage + 1, totalPages),
                })
              }
              disabled={normalizedCurrentPage === totalPages}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm sm:w-auto"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl overflow-x-hidden bg-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-[#3b82f6]">Candidates</h1>
          <p className="mt-1 break-words text-sm text-gray-500">
            Manage and review all applicants across job postings.
          </p>
        </div>

        <div className="w-full min-w-0 max-w-full sm:max-w-xs md:max-w-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Active Job
          </label>
          <div className="relative min-w-0 max-w-full">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="block w-full min-w-0 max-w-full truncate appearance-none rounded-lg border border-gray-200 bg-white px-3.5 py-2 pr-10 text-sm text-gray-600 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-left"
            >
              {selectedJob?.title || "Select a job"}
            </button>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {jobs.map((job) => (
                  <button
                    key={job._id}
                    type="button"
                    onClick={() => {
                      setSelectedJobId(job._id);
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full px-3.5 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 truncate"
                  >
                    {truncateSelectLabel(job.title)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {!jobsLoading && jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center shadow-md">
          <p className="text-lg font-medium text-gray-700">You need a job first.</p>
          <p className="text-sm text-gray-400 mt-2">
            Create a job posting before adding or uploading applicants.
          </p>
          <Link
            href="/dashboard/job-postings"
            className="inline-flex mt-5 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563eb] shadow-sm"
          >
            Create Job Posting
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-md">
              {error}
            </div>
          )}

          <div className="mb-6 w-full min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-md sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Selected Job
                </p>
                <h2 className="mt-2 break-words text-lg font-semibold text-[#3b82f6]">
                  {selectedJob?.title || "Choose a job"}
                </h2>
                <p className="mt-1 break-words text-sm text-gray-500">
                  {totalJobApplicants} total applicants linked to this job.
                </p>
              </div>

              <div className="flex w-full min-w-0 flex-wrap items-center gap-1.5 sm:gap-2 lg:w-auto lg:justify-end">
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-600 shadow-sm sm:px-2.5 sm:text-[11px]">
                  Structured {structuredApplicantsCount}
                </span>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-600 shadow-sm sm:px-2.5 sm:text-[11px]">
                  Uploaded {uploadedApplicantsCount}
                </span>
                <button
                  type="button"
                  onClick={() => void handleClearApplicants()}
                  disabled={totalJobApplicants === 0 || clearingJobId === activeJobId}
                  className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm sm:w-auto sm:px-3"
                >
                  <Trash2 className="h-3 w-3" />
                  {clearingJobId === activeJobId
                    ? "Clearing Applicants..."
                    : "Delete All Applicants"}
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6 flex w-full min-w-0 gap-6 overflow-x-auto border-b border-gray-200 pb-1">
            <button
              onClick={() => setActiveTab("structured")}
              className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "structured"
                  ? "text-[#3b82f6] border-b-2 border-[#3b82f6]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Structured Data
            </button>
            <button
              onClick={() => setActiveTab("external")}
              className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "external"
                  ? "text-[#3b82f6] border-b-2 border-[#3b82f6]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              External Uploads
            </button>
          </div>

          {activeTab === "structured" ? (
            <div className="space-y-6">
              
              {/* Trigger Card for the Modal */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-md p-4 sm:p-6 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-[#3b82f6]">
                    Add Structured Applicant
                  </h2>
                  <p className="mt-1 break-words text-sm text-gray-500">
                    Add a candidate profile directly for {selectedJob?.title || "the selected role"}.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="shrink-0 rounded-full bg-blue-50 p-3 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* Popup Modal for Add Applicant Form */}
              {isAddModalOpen && (
                <div 
                  className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 sm:p-6"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <div 
                    className="w-full max-w-3xl max-h-full sm:max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6 relative flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      onClick={() => setIsAddModalOpen(false)}
                      className="absolute top-6 right-6 p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="mb-6 pr-8 shrink-0">
                      <h2 className="text-xl font-bold text-[#3b82f6]">
                        Add Structured Applicant
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Add a candidate profile directly for {selectedJob?.title || "the selected role"}.
                      </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleStructuredSubmit}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <input
                          type="text"
                          value={structuredForm.name}
                          onChange={(event) =>
                            setStructuredForm((previous) => ({
                              ...previous,
                              name: event.target.value,
                            }))
                          }
                          placeholder="Candidate name"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm shadow-sm"
                          required
                        />
                        <input
                          type="email"
                          value={structuredForm.email}
                          onChange={(event) =>
                            setStructuredForm((previous) => ({
                              ...previous,
                              email: event.target.value,
                            }))
                          }
                          placeholder="Email address"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm shadow-sm"
                          required
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <input
                          type="text"
                          value={structuredForm.currentRole || ""}
                          onChange={(event) =>
                            setStructuredForm((previous) => ({
                              ...previous,
                              currentRole: event.target.value,
                            }))
                          }
                          placeholder="Current role"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm shadow-sm"
                        />
                        <input
                          type="number"
                          min={0}
                          value={structuredForm.experienceYears}
                          onChange={(event) =>
                            setStructuredForm((previous) => ({
                              ...previous,
                              experienceYears: Number(event.target.value),
                            }))
                          }
                          placeholder="Years of experience"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm shadow-sm"
                        />
                        <input
                          type="text"
                          value={structuredForm.education}
                          onChange={(event) =>
                            setStructuredForm((previous) => ({
                              ...previous,
                              education: event.target.value,
                            }))
                          }
                          placeholder="Education"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm shadow-sm"
                          required
                        />
                      </div>

                      <div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            type="text"
                            value={skillsInput}
                            onChange={(event) => setSkillsInput(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                addSkill();
                              }
                            }}
                            placeholder="Add skill and press Enter"
                            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={addSkill}
                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors flex items-center justify-center shadow-sm"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {structuredForm.skills.map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100"
                            >
                              {skill} ×
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        rows={4}
                        value={structuredForm.summary || ""}
                        onChange={(event) =>
                          setStructuredForm((previous) => ({
                            ...previous,
                            summary: event.target.value,
                          }))
                        }
                        placeholder="Candidate summary"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm resize-y shadow-sm"
                      />

                      <div className="flex justify-end pt-4 border-t border-gray-100 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsAddModalOpen(false)}
                          className="w-full rounded-lg bg-white border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 shadow-sm sm:w-auto mr-3"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={adding}
                          className="w-full rounded-lg bg-[#3b82f6] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563eb] disabled:bg-[#3b82f6]/40 shadow-sm sm:w-auto"
                        >
                          {adding ? "Saving..." : "Add Applicant"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {loading ? renderTableSkeleton() : renderTable(visibleApplicants)}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-md p-4 sm:p-6 lg:p-10 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold text-[#3b82f6] mb-2">
                  Import Applicants from External Sources
                </h2>
                <p className="break-words text-sm text-gray-500">
                  Bring in spreadsheets, PDF resumes, or direct resume links for {selectedJob?.title || "the selected role"}.
                </p>

                <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="rounded-full bg-white p-3 text-[#3b82f6] shadow-sm">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                          Compare Against
                        </p>
                        <h3 className="mt-1 break-words text-lg font-semibold text-[#3b82f6]">
                          {selectedJob?.title || "Selected job"}
                        </h3>
                        <p className="mt-1 break-words text-sm text-blue-700">
                          Every imported resume is attached to the active job above. After import, open AI Screening to compare the batch against this role.
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/ai-screening?jobId=${activeJobId}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#3b82f6] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563eb] shadow-sm sm:w-auto"
                    >
                      Open AI Screening
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-700 shadow-sm">
                      Up to {MAX_UPLOAD_FILES} files per batch
                    </span>
                    <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-700 shadow-sm">
                      Bulk PDF resume support
                    </span>
                    <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-700 shadow-sm">
                      Linked directly to the active job
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 sm:p-12 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group ${
                      dragOver
                        ? "border-[#3b82f6] bg-blue-50"
                        : "border-gray-300 hover:bg-gray-50/50"
                    }`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragOver(false);
                      void handleUploadSubmission({ files: event.dataTransfer.files });
                    }}
                  >
                    <Upload
                      className="w-10 h-10 text-gray-500 mb-4 group-hover:text-blue-600 transition-colors"
                      strokeWidth={1.5}
                    />
                    <h3 className="text-base font-semibold text-gray-800 mb-1">
                      Drag & Drop Files Here
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Support for PDF, CSV, XLS, and XLSX files
                    </p>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 shadow-sm sm:w-auto"
                    >
                      {uploading ? "Uploading..." : "Browse Files"}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      accept=".pdf,.csv,.xlsx,.xls"
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        void handleUploadSubmission({ files: event.target.files })
                      }
                    />
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-6 shadow-sm">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="rounded-full bg-blue-50 p-3 text-blue-700">
                        <Link2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-gray-800">
                          Import Resume Links
                        </h3>
                        <p className="mt-1 break-words text-sm text-gray-500">
                          Paste one public PDF resume URL per line and let the parser ingest them in bulk.
                        </p>
                      </div>
                    </div>

                    <textarea
                      rows={8}
                      value={resumeLinksInput}
                      onChange={(event) => setResumeLinksInput(event.target.value)}
                      placeholder={
                        "https://example.com/candidates/aline-uwase.pdf\nhttps://example.com/candidates/daniel-ntaganda.pdf"
                      }
                      className="mt-5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                    />

                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <p className="text-xs leading-5 text-gray-400">
                        Use direct PDF links so the backend can fetch and parse the resume text reliably.
                      </p>
                      <button
                        type="button"
                        onClick={() => void handleResumeLinkUpload()}
                        disabled={uploading || !resumeLinksInput.trim()}
                        className="inline-flex w-full items-center justify-center rounded-lg bg-[#3b82f6] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:bg-[#3b82f6]/40 shadow-sm md:w-auto"
                      >
                        {uploading ? "Importing..." : "Import Links"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {latestImport?.jobId === activeJobId && latestImport.count > 0 && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-5 shadow-md">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-green-900">
                        Ready to compare against the selected job
                      </h3>
                      <p className="mt-1 break-words text-sm text-green-800">
                        {latestImport.count} applicants were added to {selectedJob?.title || "the selected job"}. Open AI Screening to compare them against this role.
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/ai-screening?jobId=${activeJobId}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-green-200 bg-white px-4 py-2.5 text-sm font-medium text-green-800 transition-colors hover:bg-green-100 shadow-sm md:w-auto"
                    >
                      Compare To Job
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}

              {loading ? renderTableSkeleton() : renderTable(visibleApplicants)}
            </div>
          )}
        </>
      )}
    </div>
  );
}