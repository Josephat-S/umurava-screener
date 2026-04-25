import { CandidateInput, JobInput, ScoringWeights } from "../types/aiTypes";

export function buildScreeningPrompt(
  job: JobInput,
  candidates: CandidateInput[],
  shortlistSize = 10,
  weights: ScoringWeights,
): string {
  const requirements =
    job.requirements.length > 0 ? job.requirements.join("; ") : "Not specified";
  const skills = job.skills.length > 0 ? job.skills.join(", ") : "Not specified";

  return `
You are an expert technical recruiter with 10+ years of experience screening candidates.

## Job Details
- Title: ${job.title}
- Description: ${job.description}
- Required Skills: ${skills}
- Experience Required: ${job.experienceYears}+ years
- Education Level: ${job.educationLevel}
- Key Requirements: ${requirements}

## Scoring Criteria (Weights)
- Skills Match: ${weights.skills}% — how well their skills match the required skills
- Experience: ${weights.experience}% — relevance and years of experience
- Education: ${weights.education}% — meets or exceeds education requirement
- Profile Quality: ${weights.profile}% — clarity, completeness, professional presentation

## Your Task
Evaluate ALL ${candidates.length} candidates below against this job.
Return the TOP ${shortlistSize} best matches ONLY.

For each shortlisted candidate, provide:
- rank: their position in the shortlist (1 = best)
- candidateId: their _id field exactly as provided
- candidateName: their full name
- matchScore: integer 0-100 based on the weighted criteria above
- strengths: 2-3 sentences on why they are a strong fit
- gaps: 1-2 sentences on what they are missing or where they fall short
- recommendation: 1 clear sentence - a final hiring recommendation for the recruiter
- isIncomplete: boolean, true if the candidate profile or resume is significantly lacking information
- incompletenessReason: if isIncomplete is true, a brief explanation of what's missing

## Candidates
${JSON.stringify(candidates, null, 2)}

## Output Format
Return ONLY a valid JSON array. No markdown. No explanation. No backticks.
Example structure:
[
  {
    "rank": 1,
    "candidateId": "abc123",
    "candidateName": "Jane Doe",
    "matchScore": 87,
    "strengths": "Strong React and TypeScript skills. 5 years of relevant experience.",
    "gaps": "No formal computer science degree, though self-taught with strong portfolio.",
    "recommendation": "Highly recommended - meets all core requirements and brings relevant industry experience.",
    "isIncomplete": false,
    "incompletenessReason": ""
  }
]
`.trim();
}
