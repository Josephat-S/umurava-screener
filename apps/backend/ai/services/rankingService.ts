import { ScoredCandidate } from "../types/aiTypes";

const clampScore = (score: number): number => Math.max(0, Math.min(100, Math.round(score)));

export function buildFinalShortlist(
  candidates: ScoredCandidate[],
  shortlistSize = 10,
): ScoredCandidate[] {
  const seen = new Set<string>();

  const unique = candidates.filter((candidate) => {
    if (!candidate.candidateId || seen.has(candidate.candidateId)) {
      return false;
    }

    seen.add(candidate.candidateId);
    return Boolean(
      candidate.strengths.trim() &&
        candidate.gaps.trim() &&
        candidate.recommendation.trim(),
    );
  });

  return unique
    .sort((left, right) => right.matchScore - left.matchScore)
    .slice(0, shortlistSize)
    .map((candidate, index) => ({
      ...candidate,
      rank: index + 1,
      matchScore: clampScore(candidate.matchScore),
      strengths: candidate.strengths.trim(),
      gaps: candidate.gaps.trim(),
      recommendation: candidate.recommendation.trim(),
    }));
}
