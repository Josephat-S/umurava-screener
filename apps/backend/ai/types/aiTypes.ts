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
}

export interface ScreeningOutput {
  jobId: string;
  shortlist: ScoredCandidate[];
  totalApplicants: number;
  shortlistSize: number;
  processedAt: Date;
}

export interface WeightedScore {
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  profileScore: number;
  total: number;
}
