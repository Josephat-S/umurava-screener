"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  Upload,
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
        <div className="p-8 bg-gray-50 min-h-screen">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-16 text-center text-gray-400">
            Loading candidates...
          </div>
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
  const { applicants, loading, uploading, adding, error } = useAppSelector(
    (state) => state.applicants,
  );
  const shortlist = useAppSelector((state) => state.screening.shortlist);

  const [activeTab, setActiveTab] = useState<"structured" | "external">("structured");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [paginationState, setPaginationState] = useState({
    key: "",
    page: 1,
  });
  const [skillsInput, setSkillsInput] = useState("");
  const [structuredForm, setStructuredForm] =
    useState<StructuredApplicantInput>(INITIAL_APPLICANT_FORM);

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
    } catch (submitError) {
      toast.error((submitError as Error).message || "Failed to add applicant");
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!activeJobId) {
      toast.error("Select a job before uploading files.");
      return;
    }

    if (!files || files.length === 0) {
      return;
    }

    try {
      const payload = Array.from(files);
      const result = await dispatch(
        uploadApplicantFiles({ jobId: activeJobId, files: payload }),
      ).unwrap();
      setPaginationState({ key: paginationKey, page: 1 });
      toast.success(`${result.length} applicants uploaded successfully.`);
    } catch (uploadError) {
      toast.error((uploadError as Error).message || "Upload failed");
    }
  };

  const renderTable = (rows: Applicant[]) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">
          {activeTab === "structured" ? "Structured Applicants" : "Uploaded Applicants"}
        </h2>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search candidates..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors w-full sm:w-64"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            {totalFilteredApplicants} Results
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-sm text-gray-500 border-b border-gray-100">
              <th className="py-4 pl-6 pr-4 w-12">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="py-4 px-4 font-medium">Name</th>
              <th className="py-4 px-4 font-medium">Match Score</th>
              <th className="py-4 px-4 font-medium">Job Applied</th>
              <th className="py-4 px-4 font-medium">Applied Date</th>
              <th className="py-4 px-6 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                  No applicants in this view yet.
                </td>
              </tr>
            ) : (
              rows.map((applicant) => {
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
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{applicant.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{applicant.email}</p>
                      </div>
                    </td>
                    <td className={`py-4 px-4 text-sm ${getScoreColor(score)}`}>
                      {typeof score === "number" ? `${score}%` : "—"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {selectedJob?.title || "Selected job"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {formatDate(applicant.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {shouldPaginate && totalFilteredApplicants > 0 && (
        <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-500">
            Showing {pageStart}-{pageEnd} of {totalFilteredApplicants} {currentViewLabel}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium uppercase tracking-wide text-gray-400 sm:inline-flex">
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
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">
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
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Candidates</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage and review all applicants across job postings.
          </p>
        </div>

        <div className="w-full max-w-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Active Job
          </label>
          <div className="relative">
            <select
              value={activeJobId}
              onChange={(event) => setSelectedJobId(event.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm appearance-none bg-white text-gray-600"
            >
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {!jobsLoading && jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
          <p className="text-lg font-medium text-gray-700">You need a job first.</p>
          <p className="text-sm text-gray-400 mt-2">
            Create a job posting before adding or uploading applicants.
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
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-6 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("structured")}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === "structured"
                  ? "text-[#260af5] border-b-2 border-[#260af5]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Structured Data
            </button>
            <button
              onClick={() => setActiveTab("external")}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === "external"
                  ? "text-[#260af5] border-b-2 border-[#260af5]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              External Uploads
            </button>
          </div>

          {activeTab === "structured" ? (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Add Structured Applicant
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Add a candidate profile directly for {selectedJob?.title || "the selected role"}.
                    </p>
                  </div>
                  <div className="rounded-full bg-blue-50 p-3 text-blue-700">
                    <Plus className="h-5 w-5" />
                  </div>
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
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
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
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
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
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
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
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
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
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex gap-2">
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
                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors flex items-center justify-center"
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
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm resize-y"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={adding}
                      className="px-6 py-2.5 rounded-lg bg-[#260af5] text-white text-sm font-medium hover:bg-[#1a05cc] disabled:bg-[#260af5]/40 transition-colors"
                    >
                      {adding ? "Saving..." : "Add Applicant"}
                    </button>
                  </div>
                </form>
              </div>

              {loading ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-16 text-center text-gray-400">
                  Loading applicants...
                </div>
              ) : (
                renderTable(visibleApplicants)
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-10 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold text-gray-800 mb-6">Upload CVs or CSV</h2>

                <div
                  className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group ${
                    dragOver
                      ? "border-[#260af5] bg-blue-50"
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
                    void handleUpload(event.dataTransfer.files);
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
                    className="px-6 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
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
                      void handleUpload(event.target.files)
                    }
                  />
                </div>
              </div>

              {loading ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-16 text-center text-gray-400">
                  Loading applicants...
                </div>
              ) : (
                renderTable(visibleApplicants)
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
