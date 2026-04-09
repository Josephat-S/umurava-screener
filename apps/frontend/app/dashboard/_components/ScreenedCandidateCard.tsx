"use client";

import type { ScoredCandidate } from "@/types";

interface ScreenedCandidateCardProps {
  candidate: ScoredCandidate;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelection?: (candidateId: string) => void;
}

function getScoreStyles(score: number) {
  if (score >= 70) {
    return {
      badge: "bg-green-50 text-green-700 border-green-200",
      bar: "bg-green-500",
      label: "Strong Match",
    };
  }

  if (score >= 40) {
    return {
      badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
      bar: "bg-yellow-500",
      label: "Moderate Match",
    };
  }

  return {
    badge: "bg-red-50 text-red-700 border-red-200",
    bar: "bg-red-500",
    label: "Weak Match",
  };
}

function getConfidenceStyles(candidate: ScoredCandidate) {
  if (candidate.confidenceLevel === "high") {
    return {
      badge: "bg-green-50 text-green-700 border-green-200",
      label: "High Confidence",
      reason:
        candidate.confidenceReason ||
        "Structured profile data gives the AI strong matching signals.",
    };
  }

  if (candidate.confidenceLevel === "low") {
    return {
      badge: "bg-orange-50 text-orange-700 border-orange-200",
      label: "Low Confidence",
      reason:
        candidate.confidenceReason ||
        "The score is based mostly on unstructured resume information.",
    };
  }

  return {
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
    label: "Medium Confidence",
    reason:
      candidate.confidenceReason ||
      "The AI had partial profile data, so recruiter review is recommended.",
  };
}

export default function ScreenedCandidateCard({
  candidate,
  selectable = false,
  selected = false,
  onToggleSelection,
}: ScreenedCandidateCardProps) {
  const styles = getScoreStyles(candidate.matchScore);
  const confidence = getConfidenceStyles(candidate);

  return (
    <article className="w-full max-w-full overflow-hidden rounded-xl border border-gray-100 bg-white p-3 shadow-md transition-shadow duration-200 hover:shadow-lg sm:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          {selectable && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelection?.(candidate.candidateId)}
              className="mt-2.5 h-4 w-4 rounded border-gray-300 text-[#3b82f6] focus:ring-[#3b82f6]"
            />
          )}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3b82f6] text-sm font-bold text-white shadow-sm sm:h-11 sm:w-11">
            #{candidate.rank}
          </div>
          <div className="min-w-0">
            <h3 className="break-words [overflow-wrap:anywhere] text-base font-bold text-gray-800 sm:text-lg">
              {candidate.candidateName}
            </h3>
          </div>
        </div>

        <div
          className={`flex w-full min-w-0 flex-wrap items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold sm:w-auto sm:px-3 sm:text-sm ${styles.badge}`}
        >
          <span className="shrink-0">{candidate.matchScore}%</span>
          <span className="shrink-0">•</span>
          <span className="min-w-0 break-words [overflow-wrap:anywhere]">{styles.label}</span>
        </div>
      </div>

      <div className="mt-4 sm:mt-5">
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full ${styles.bar}`}
            style={{ width: `${candidate.matchScore}%` }}
          />
        </div>
      </div>

      <div
        className={`mt-3 flex w-full min-w-0 flex-col gap-1 rounded-xl border px-2.5 py-2 text-[11px] font-medium sm:mt-4 sm:px-3 sm:text-xs ${confidence.badge}`}
      >
        <span className="shrink-0 font-semibold">{confidence.label}</span>
        <span className="min-w-0 break-words [overflow-wrap:anywhere] text-gray-500">{confidence.reason}</span>
      </div>

      <div className="mt-4 min-w-0 max-w-full grid gap-3 lg:grid-cols-3 sm:mt-5 sm:gap-4">
        <section className="min-w-0 rounded-xl border border-green-100 bg-green-50 p-3 shadow-sm sm:p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-green-700 sm:text-xs">
            Strengths
          </p>
          <p className="min-w-0 break-words [overflow-wrap:anywhere] text-xs leading-5 text-gray-700 sm:text-sm sm:leading-6">{candidate.strengths}</p>
        </section>

        <section className="min-w-0 rounded-xl border border-orange-100 bg-orange-50 p-3 shadow-sm sm:p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-orange-700 sm:text-xs">
            Gaps
          </p>
          <p className="min-w-0 break-words [overflow-wrap:anywhere] text-xs leading-5 text-gray-700 sm:text-sm sm:leading-6">{candidate.gaps}</p>
        </section>

        <section className="min-w-0 rounded-xl border border-blue-100 bg-blue-50 p-3 shadow-sm sm:p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-blue-700 sm:text-xs">
            Recommendation
          </p>
          <p className="min-w-0 break-words [overflow-wrap:anywhere] text-xs leading-5 text-gray-700 sm:text-sm sm:leading-6">
            {candidate.recommendation}
          </p>
        </section>
      </div>
    </article>
  );
}
