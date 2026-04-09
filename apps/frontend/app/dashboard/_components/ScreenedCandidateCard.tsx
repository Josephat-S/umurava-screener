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
    <article className="bg-white rounded-xl border border-gray-100 p-4 shadow-md transition-shadow duration-200 hover:shadow-lg sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {selectable && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelection?.(candidate.candidateId)}
              className="mt-3 h-4 w-4 rounded border-gray-300 text-[#3b82f6] focus:ring-[#3b82f6]"
            />
          )}
          <div className="h-11 w-11 shrink-0 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-sm font-bold shadow-sm">
            #{candidate.rank}
          </div>
          <div className="min-w-0">
            <h3 className="break-words text-lg font-bold text-gray-800">
              {candidate.candidateName}
            </h3>
          </div>
        </div>

        <div
          className={`inline-flex max-w-full items-center rounded-full border px-3 py-1 text-sm font-semibold ${styles.badge}`}
        >
          {candidate.matchScore}% • {styles.label}
        </div>
      </div>

      <div className="mt-5">
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full ${styles.bar}`}
            style={{ width: `${candidate.matchScore}%` }}
          />
        </div>
      </div>

      <div
        className={`mt-4 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${confidence.badge}`}
        >
        <span>{confidence.label}</span>
        <span className="break-words text-gray-500">{confidence.reason}</span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl bg-green-50 p-4 border border-green-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700 mb-2">
            Strengths
          </p>
          <p className="break-words text-sm leading-6 text-gray-700">{candidate.strengths}</p>
        </section>

        <section className="rounded-xl bg-orange-50 p-4 border border-orange-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 mb-2">
            Gaps
          </p>
          <p className="break-words text-sm leading-6 text-gray-700">{candidate.gaps}</p>
        </section>

        <section className="rounded-xl bg-blue-50 p-4 border border-blue-100 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-2">
            Recommendation
          </p>
          <p className="break-words text-sm leading-6 text-gray-700">
            {candidate.recommendation}
          </p>
        </section>
      </div>
    </article>
  );
}
