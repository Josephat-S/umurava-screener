"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import EmptyState from "../_components/EmptyState";
import {
  createJob,
  deleteJob,
  fetchJobs,
  parseJobDescription,
  updateJob,
} from "@/store/slices/jobSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { Job, JobFormData } from "@/types";

const INITIAL_FORM: JobFormData = {
  title: "",
  description: "",
  requirements: [],
  skills: [],
  experienceYears: 0,
  educationLevel: "",
  location: "",
  shortlistSize: 10,
};

const mapJobToForm = (job: Job): JobFormData => ({
  title: job.title,
  description: job.description,
  requirements: job.requirements,
  skills: job.skills,
  experienceYears: job.experienceYears,
  educationLevel: job.educationLevel,
  location: job.location || "",
  shortlistSize: job.shortlistSize,
});

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function CreateJobPostingPage() {
  const dispatch = useAppDispatch();
  const { jobs, loading, saving, parsing, deletingJobId, error } = useAppSelector(
    (state) => state.jobs,
  );

  const [form, setForm] = useState<JobFormData>(INITIAL_FORM);
  const [skillInput, setSkillInput] = useState("");
  const [requirementInput, setRequirementInput] = useState("");
  const [rawDescription, setRawDescription] = useState("");
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  useEffect(() => {
    void dispatch(fetchJobs());
  }, [dispatch]);

  const sortedJobs = useMemo(
    () =>
      [...jobs].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      ),
    [jobs],
  );

  const addToken = (type: "skills" | "requirements") => {
    const currentValue = (type === "skills" ? skillInput : requirementInput).trim();
    if (!currentValue) return;

    setForm((previous) => ({
      ...previous,
      [type]: Array.from(new Set([...previous[type], currentValue])),
    }));

    if (type === "skills") {
      setSkillInput("");
    } else {
      setRequirementInput("");
    }
  };

  const removeToken = (type: "skills" | "requirements", value: string) => {
    setForm((previous) => ({
      ...previous,
      [type]: previous[type].filter((item) => item !== value),
    }));
  };

  const handleEnter =
    (type: "skills" | "requirements") => (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addToken(type);
      }
    };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setSkillInput("");
    setRequirementInput("");
    setRawDescription("");
    setEditingJobId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.skills.length === 0) {
      toast.error("Add at least one required skill before saving the job.");
      return;
    }

    try {
      if (editingJobId) {
        await dispatch(updateJob({ id: editingJobId, data: form })).unwrap();
        toast.success("Job updated successfully.");
      } else {
        await dispatch(createJob(form)).unwrap();
        toast.success("Job created successfully.");
      }
      resetForm();
    } catch (submitError) {
      toast.error(
        (submitError as Error).message ||
          (editingJobId ? "Failed to update job" : "Failed to create job"),
      );
    }
  };

  const handleDelete = async (jobId: string) => {
    try {
      await dispatch(deleteJob(jobId)).unwrap();
      if (editingJobId === jobId) {
        resetForm();
      }
      toast.success("Job deleted successfully.");
    } catch (deleteError) {
      toast.error((deleteError as Error).message || "Failed to delete job");
    }
  };

  const handleStartEdit = (job: Job) => {
    setForm(mapJobToForm(job));
    setSkillInput("");
    setRequirementInput("");
    setRawDescription("");
    setEditingJobId(job._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleParseDescription = async () => {
    if (!rawDescription.trim()) {
      toast.error("Paste a job description before asking AI to parse it.");
      return;
    }

    try {
      const parsed = await dispatch(parseJobDescription(rawDescription)).unwrap();

      setForm((previous) => ({
        ...previous,
        title: parsed.title || previous.title,
        description: parsed.description || previous.description,
        skills: parsed.skills.length > 0 ? parsed.skills : previous.skills,
        requirements:
          parsed.requirements.length > 0
            ? parsed.requirements
            : previous.requirements,
        experienceYears:
          parsed.experienceYears || previous.experienceYears,
        educationLevel: parsed.educationLevel || previous.educationLevel,
        location: parsed.location || previous.location,
      }));
      setRawDescription("");
      toast.success("Job description parsed successfully.");
    } catch (parseError) {
      toast.error((parseError as Error).message || "Failed to parse job description");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Job Postings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Create and update role requirements without changing your current workflow.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {editingJobId ? "Edit Job Details" : "Job Details"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {editingJobId
                  ? "Update the role requirements, shortlist size, or AI-ready criteria."
                  : "Define the ideal candidate profile for AI screening."}
              </p>
            </div>

            {editingJobId && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Editing existing role
              </span>
            )}
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-blue-900">
                    Parse with AI
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Paste a full job description and let AI draft the form fields for you.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleParseDescription}
                  disabled={parsing || !rawDescription.trim()}
                  className="inline-flex rounded-lg bg-[#260af5] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1a05cc] disabled:cursor-not-allowed disabled:bg-[#260af5]/40"
                >
                  {parsing ? "Parsing..." : "Parse with AI"}
                </button>
              </div>

              <textarea
                rows={5}
                value={rawDescription}
                onChange={(event) => setRawDescription(event.target.value)}
                placeholder="Paste the full job description here..."
                className="mt-4 w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, title: event.target.value }))
                  }
                  placeholder="e.g. Senior AI Engineer"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education Level <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.educationLevel}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        educationLevel: event.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm appearance-none bg-white text-gray-600"
                    required
                  >
                    <option value="" disabled>
                      Select education level
                    </option>
                    <option value="High School">High School</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Master">Master</option>
                    <option value="PhD">PhD</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                placeholder="Describe the role, responsibilities, and what makes a great candidate..."
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm resize-y"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(event) => setSkillInput(event.target.value)}
                  onKeyDown={handleEnter("skills")}
                  placeholder="Type a skill and press Enter"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => addToken("skills")}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {form.skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => removeToken("skills", skill)}
                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100"
                  >
                    {skill} ×
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Requirements
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={requirementInput}
                  onChange={(event) => setRequirementInput(event.target.value)}
                  onKeyDown={handleEnter("requirements")}
                  placeholder="Type a requirement and press Enter"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => addToken("requirements")}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {form.requirements.map((requirement) => (
                  <button
                    key={requirement}
                    type="button"
                    onClick={() => removeToken("requirements", requirement)}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200"
                  >
                    {requirement} ×
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.experienceYears}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      experienceYears: Number(event.target.value),
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location || ""}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      location: event.target.value,
                    }))
                  }
                  placeholder="e.g. Kigali, Rwanda"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shortlist Size
                </label>
                <div className="relative">
                  <select
                    value={form.shortlistSize}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        shortlistSize: Number(event.target.value) as 10 | 20,
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm appearance-none bg-white text-gray-600"
                  >
                    <option value={10}>Top 10</option>
                    <option value={20}>Top 20</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-gray-100 flex justify-end gap-4">
              {editingJobId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {editingJobId ? "Clear Form" : "Reset"}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2 text-sm font-medium text-white bg-[#260af5] rounded-lg hover:bg-[#1a05cc] disabled:bg-[#260af5]/40 transition-colors"
              >
                {saving
                  ? "Saving..."
                  : editingJobId
                    ? "Save Changes"
                    : "Create Job"}
              </button>
            </div>
          </form>
        </div>

        <aside className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Existing Roles</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage the jobs already connected to your pipeline.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {jobs.length}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400">Loading jobs...</div>
          ) : sortedJobs.length === 0 ? (
            <EmptyState
              icon={<Plus className="h-5 w-5" />}
              title="No jobs created yet"
              description="Your new roles will appear here as soon as you save them."
            />
          ) : (
            <div className="space-y-4">
              {sortedJobs.map((job) => (
                <article
                  key={job._id}
                  className={`rounded-xl border p-4 ${
                    editingJobId === job._id
                      ? "border-blue-200 bg-blue-50/60"
                      : "border-gray-100 bg-gray-50/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-800">{job.title}</h3>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-blue-700 border border-blue-100">
                          Top {job.shortlistSize}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(job.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(job)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(job._id)}
                        disabled={deletingJobId === job._id}
                        className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-white px-2.5 py-1 text-xs text-gray-600 border border-gray-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/candidates?jobId=${job._id}`}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Manage Candidates
                    </Link>
                    <Link
                      href={`/dashboard/ai-screening?jobId=${job._id}`}
                      className="rounded-lg bg-[#260af5] px-3 py-2 text-xs font-medium text-white hover:bg-[#1a05cc]"
                    >
                      Open Screening
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
