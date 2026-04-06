import { CandidateInput, JobInput, WeightedScore } from "../types/aiTypes";

const EDUCATION_LEVELS = ["high school", "diploma", "associate", "bachelor", "master", "phd"];

export function scoreCandidate(
  candidate: CandidateInput,
  job: JobInput,
): WeightedScore {
  const requiredSkills = job.skills.map((skill) => skill.toLowerCase().trim()).filter(Boolean);
  const candidateSkills = candidate.skills
    .map((skill) => skill.toLowerCase().trim())
    .filter(Boolean);
  const matchedSkills = requiredSkills.filter((skill) => candidateSkills.includes(skill));
  const skillsScore =
    requiredSkills.length > 0 ? (matchedSkills.length / requiredSkills.length) * 40 : 40;

  const expBase = Math.max(job.experienceYears, 1);
  const expRatio = Math.min(candidate.experienceYears / expBase, 1.2);
  const experienceScore = Math.min(expRatio * 30, 30);

  const educationScore = meetsEducationRequirement(candidate.education, job.educationLevel)
    ? 15
    : 5;

  const profileScore = assessProfileCompleteness(candidate);
  const total = skillsScore + experienceScore + educationScore + profileScore;

  return {
    skillsScore: Math.round(skillsScore),
    experienceScore: Math.round(experienceScore),
    educationScore,
    profileScore: Math.round(profileScore),
    total: Math.round(total),
  };
}

function educationLevelIndex(value: string): number {
  const normalized = value.toLowerCase();
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

function assessProfileCompleteness(candidate: CandidateInput): number {
  let score = 0;

  if (candidate.name) score += 3;
  if (candidate.email) score += 2;
  if (candidate.skills.length > 0) score += 3;
  if (candidate.summary || candidate.resumeText) score += 4;
  if (candidate.currentRole) score += 3;

  return Math.min(score, 15);
}

export function filterCandidates(
  candidates: CandidateInput[],
  job: JobInput,
  minScore = Number(process.env.MIN_CANDIDATE_SCORE ?? 20),
): CandidateInput[] {
  return candidates.filter((candidate) => scoreCandidate(candidate, job).total >= minScore);
}
