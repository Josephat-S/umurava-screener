export interface JobInput {
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  experienceYears: number;
  educationLevel: string;
  location?: string;
  shortlistSize?: number;
}

export type CandidateSource = "platform" | "upload";
export type CandidateStatus =
  | "shortlisted"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface ScoringWeights {
  skills: number;
  experience: number;
  education: number;
  profile: number;
}

export interface CandidateInput {
  _id?: string;
  name: string;
  email: string;
  skills: string[];
  experienceYears: number;
  education: string;
  currentRole?: string;
  summary?: string;
  resumeText?: string;
  source?: CandidateSource;
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
  source?: CandidateSource;
  confidenceLevel?: ConfidenceLevel;
  confidenceReason?: string;
}

export interface ScreeningOutput {
  jobId: string;
  shortlist: ScoredCandidate[];
  totalApplicants: number;
  shortlistSize: number;
  processedAt: Date;
}

export interface ScreeningHistoryEntry {
  processedAt: Date;
  totalApplicants: number;
  shortlistSize: number;
  avgMatchScore: number;
  weights: ScoringWeights;
}

export interface WeightedScore {
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  profileScore: number;
  total: number;
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

export interface AnalyticsSummary {
  totalJobs: number;
  totalApplicants: number;
  totalScreened: number;
  avgMatchScore: number;
  topSkill: string;
}
