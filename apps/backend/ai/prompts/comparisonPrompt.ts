import { CandidateInput, JobInput } from "../types/aiTypes";

export function buildComparisonPrompt(
  job: JobInput,
  candidates: CandidateInput[],
): string {
  return `
You are an expert technical recruiter. Your task is to provide a detailed comparative analysis between the following candidates for the role of "${job.title}".

## Job Requirements
- Skills: ${job.skills.join(", ")}
* Experience: ${job.experienceYears}+ years
- Education: ${job.educationLevel}

## Candidates to Compare
${JSON.stringify(candidates, null, 2)}

## Your Task
Analyze these candidates and explain WHY they are ranked in their current order. 
Be specific about:
1. Technical skill depth vs breadth.
2. Relevance of their specific work history to this job.
3. Why the #1 candidate is slightly better than the #2 candidate.
4. Any specific "edge" one has over the others (e.g. specific tool mastery, industry experience).

## Output Format
Return your analysis in 3-4 professional paragraphs. Use clear, recruiter-friendly language.
Return ONLY the text of your analysis. No markdown. No headers.
  `.trim();
}
