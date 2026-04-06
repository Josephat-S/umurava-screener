"use client";

import type { ScoredCandidate } from "@/types";

interface ScreenedCandidateCardProps {
  candidate: ScoredCandidate;
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

export default function ScreenedCandidateCard({
  candidate,
}: ScreenedCandidateCardProps) {
  const styles = getScoreStyles(candidate.matchScore);

  return (
    <article className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 shrink-0 rounded-full bg-[#260af5] text-white flex items-center justify-center text-sm font-bold shadow-sm">
            #{candidate.rank}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {candidate.candidateName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Candidate ID: {candidate.candidateId}
            </p>
          </div>
        </div>

        <div
          className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${styles.badge}`}
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

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl bg-green-50 p-4 border border-green-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700 mb-2">
            Strengths
          </p>
          <p className="text-sm leading-6 text-gray-700">{candidate.strengths}</p>
        </section>

        <section className="rounded-xl bg-orange-50 p-4 border border-orange-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 mb-2">
            Gaps
          </p>
          <p className="text-sm leading-6 text-gray-700">{candidate.gaps}</p>
        </section>

        <section className="rounded-xl bg-blue-50 p-4 border border-blue-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-2">
            Recommendation
          </p>
          <p className="text-sm leading-6 text-gray-700">
            {candidate.recommendation}
          </p>
        </section>
      </div>
    </article>
  );
}
