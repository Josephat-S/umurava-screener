import {
  CandidateInput,
  JobInput,
  ScoringWeights,
  WeightedScore,
} from "../types/aiTypes";

const EDUCATION_LEVELS = ["high school", "diploma", "associate", "bachelor", "master", "phd"];
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  skills: 40,
  experience: 30,
  education: 15,
  profile: 15,
};

function scaleToWeight(baseScore: number, weight: number): number {
  return Math.min(Math.max(baseScore, 0), 1) * weight;
}

export function scoreCandidate(
  candidate: CandidateInput,
  job: JobInput,
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS,
): WeightedScore {
  const requiredSkills = (job.skills || [])
    .map((skill) => (skill || "").toLowerCase().trim())
    .filter(Boolean);
  const candidateSkills = (candidate.skills || [])
    .map((skill) => (skill?.name || "").toLowerCase().trim())
    .filter(Boolean);
  const matchedSkills = requiredSkills.filter((skill) => candidateSkills.includes(skill));
  const skillsScore =
    requiredSkills.length > 0
      ? scaleToWeight(matchedSkills.length / requiredSkills.length, weights.skills)
      : weights.skills;

  const expBase = Math.max(job.experienceYears || 0, 1);
  const totalExperienceYears = (candidate.skills || []).reduce(
    (max, skill) => Math.max(max, skill?.yearsOfExperience || 0),
    0,
  );
  const expRatio = Math.min(totalExperienceYears / expBase, 1.2);
  const experienceScore = Math.min(
    expRatio * (weights.experience || 0),
    weights.experience || 0,
  );

  const educationText = (candidate.education || [])
    .map((e) => `${e?.degree || "Unknown"} in ${e?.fieldOfStudy || "Unknown"}`)
    .join(", ");
  const educationScore = meetsEducationRequirement(
    educationText,
    job.educationLevel || "",
  )
    ? weights.education || 0
    : Math.max(Math.round((weights.education || 0) * 0.35), 0);

  const profileScore = assessProfileCompleteness(candidate, weights.profile);
  const total = skillsScore + experienceScore + educationScore + profileScore;

  return {
    skillsScore: Math.round(skillsScore),
    experienceScore: Math.round(experienceScore),
    educationScore: Math.round(educationScore),
    profileScore: Math.round(profileScore),
    total: Math.round(total),
  };
}

function educationLevelIndex(value: string): number {
  const normalized = (value || "").toLowerCase();
  return EDUCATION_LEVELS.findIndex((level) => normalized.includes(level));
}

function meetsEducationRequirement(candidateEdu: string, requiredEdu: string): boolean {
  const requiredIndex = educationLevelIndex(requiredEdu);

  if (requiredIndex === -1) {
    return candidateEdu.trim().length > 0;
  }

  const candidateIndex = educationLevelIndex(candidateEdu);
  return candidateIndex >= requiredIndex;
}

export function checkProfileCompleteness(candidate: CandidateInput): {
  isIncomplete: boolean;
  reason?: string;
} {
  const missing: string[] = [];

  if (!candidate.firstName || !candidate.lastName) missing.push("Name");
  if (!candidate.email) missing.push("Email");
  if (!candidate.skills || candidate.skills.length === 0)
    missing.push("Skills");
  if (!candidate.experience || candidate.experience.length === 0)
    missing.push("Work Experience");
  if (!candidate.education || candidate.education.length === 0)
    missing.push("Education");

  if (missing.length > 0) {
    return {
      isIncomplete: true,
      reason: `Missing critical profile information: ${missing.join(", ")}`,
    };
  }

  return { isIncomplete: false };
}

function assessProfileCompleteness(
  candidate: CandidateInput,
  weight: number,
): number {
  let score = 0;

  if (candidate.firstName && candidate.lastName) score += 3;
  if (candidate.email) score += 2;
  if (candidate.skills && candidate.skills.length > 0) score += 3;
  if (candidate.headline || candidate.bio || candidate.resumeText) score += 4;
  if (candidate.experience && candidate.experience.length > 0) score += 3;

  return scaleToWeight(Math.min(score, 15) / 15, weight);
}

export function filterCandidates(
  candidates: CandidateInput[],
  job: JobInput,
  minScore = Number(process.env.MIN_CANDIDATE_SCORE ?? 20),
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS,
): CandidateInput[] {
  return candidates.filter(
    (candidate) => scoreCandidate(candidate, job, weights).total >= minScore,
  );
}
