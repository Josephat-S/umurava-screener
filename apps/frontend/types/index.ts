export interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  experienceYears: number;
  educationLevel: string;
  location?: string;
  shortlistSize: 10 | 20;
  createdAt: string;
  updatedAt: string;
}

export interface ScoringWeights {
  skills: number;
  experience: number;
  education: number;
  profile: number;
}

export type CandidateStatus =
  | "shortlisted"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface Applicant {
  _id: string;
  jobId: string;
  name: string;
  email: string;
  skills: string[];
  experienceYears: number;
  education: string;
  currentRole?: string;
  summary?: string;
  resumeText?: string;
  source: "platform" | "upload";
  createdAt: string;
  updatedAt?: string;
}

export interface ScoredCandidate {
  rank: number;
  candidateId: string;
  candidateName: string;
  matchScore: number;
  strengths: string;
  gaps: string;
  recommendation: string;
  status?: CandidateStatus;
  source?: Applicant["source"];
  confidenceLevel?: ConfidenceLevel;
  confidenceReason?: string;
}

export interface ScreeningHistoryEntry {
  processedAt: string;
  totalApplicants: number;
  shortlistSize: number;
  avgMatchScore: number;
  weights: ScoringWeights;
}

export interface ScreeningResult {
  _id: string;
  jobId: string | Job;
  shortlist: ScoredCandidate[];
  totalApplicants: number;
  shortlistSize: number;
  processedAt: string;
  lastUsedWeights?: ScoringWeights;
  history: ScreeningHistoryEntry[];
  createdAt: string;
}

export interface AnalyticsSummary {
  totalJobs: number;
  totalApplicants: number;
  totalScreened: number;
  avgMatchScore: number;
  topSkill: string;
}

export interface ParsedJobDescription {
  title: string;
  description: string;
  skills: string[];
  requirements: string[];
  experienceYears: number;
  educationLevel: string;
  location?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  error?: unknown;
}

export interface JobFormData {
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  experienceYears: number;
  educationLevel: string;
  location?: string;
  shortlistSize: 10 | 20;
}

export interface StructuredApplicantInput {
  name: string;
  email: string;
  skills: string[];
  experienceYears: number;
  education: string;
  currentRole?: string;
  summary?: string;
}

export type ApiError = Error & {
  status?: number;
  data?: unknown;
};
