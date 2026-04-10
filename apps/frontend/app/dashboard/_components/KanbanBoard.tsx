"use client";

import type { CandidateStatus, ScoredCandidate } from "@/types";

const COLUMNS: { id: CandidateStatus; label: string; styles: string }[] = [
  { id: "shortlisted", label: "Shortlisted", styles: "border-blue-200 bg-blue-50" },
  { id: "interview", label: "Interview", styles: "border-yellow-200 bg-yellow-50" },
  { id: "offer", label: "Offer", styles: "border-purple-200 bg-purple-50" },
  { id: "hired", label: "Hired", styles: "border-green-200 bg-green-50" },
  { id: "rejected", label: "Rejected", styles: "border-red-200 bg-red-50" },
];

interface KanbanBoardProps {
  shortlist: ScoredCandidate[];
  updatingCandidateId: string | null;
  onMove: (candidateId: string, status: CandidateStatus) => void;
}

export default function KanbanBoard({
  shortlist,
  updatingCandidateId,
  onMove,
}: KanbanBoardProps) {
  return (
    <div className="w-full max-w-full">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 sm:gap-4">
        {COLUMNS.map((column) => {
          const candidates = shortlist.filter(
            (candidate) => (candidate.status || "shortlisted") === column.id,
          );

          return (
            <section
              key={column.id}
              className={`min-w-0 rounded-xl border p-4 ${column.styles}`}
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-800">{column.label}</h3>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-500">
                  {candidates.length}
                </span>
              </div>

              <div className="space-y-3">
                {candidates.map((candidate) => (
                  <article
                    key={candidate.candidateId}
                    className="rounded-xl border border-white bg-white p-3 shadow-sm"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words text-sm font-semibold text-gray-800">
                          {candidate.candidateName}
                        </p>
                        <p className="mt-1 break-words text-xs text-gray-400">
                          Rank #{candidate.rank} • {candidate.matchScore}%
                        </p>
                      </div>
                    </div>

                    <select
                      value={candidate.status || "shortlisted"}
                      onChange={(event) =>
                        onMove(candidate.candidateId, event.target.value as CandidateStatus)
                      }
                      disabled={updatingCandidateId === candidate.candidateId}
                      className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {COLUMNS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </article>
                ))}

                {candidates.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/70 px-3 py-6 text-center text-xs text-gray-400 break-words">
                    No candidates in this stage yet.
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
