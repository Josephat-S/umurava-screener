import { ScoredCandidate } from "../types/aiTypes";

export function buildRankingPrompt(
  candidates: ScoredCandidate[],
  shortlistSize = 10,
): string {
  return `
You are reviewing an AI-generated shortlist for a recruiter.

Re-rank the following candidates and return ONLY the top ${shortlistSize} as valid JSON.
Preserve the same fields: rank, candidateId, candidateName, matchScore, strengths, gaps, recommendation.
Sort by strongest overall fit, keep explanations concise, and return only a JSON array.

Candidates:
${JSON.stringify(candidates, null, 2)}
`.trim();
}
