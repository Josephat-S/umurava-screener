"use client";

import { X } from "lucide-react";
import type { ScoredCandidate } from "@/types";

interface ComparisonViewProps {
  candidates: ScoredCandidate[];
  onClose: () => void;
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 rounded-full bg-gray-100">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="w-10 text-sm font-semibold text-gray-700">{score}</span>
    </div>
  );
}

export default function ComparisonView({
  candidates,
  onClose,
}: ComparisonViewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Candidate Comparison</h2>
            <p className="mt-1 text-sm text-gray-500">
              Compare the finalists side by side before making the next hiring move.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-x-auto p-6">
          <table className="min-w-[720px] w-full">
            <thead>
              <tr>
                <th className="w-40 pb-4 text-left text-sm font-semibold text-gray-500">
                  Criteria
                </th>
                {candidates.map((candidate) => (
                  <th key={candidate.candidateId} className="px-4 pb-4 text-left">
                    <div className="text-base font-semibold text-gray-800">
                      {candidate.candidateName}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      Rank #{candidate.rank}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-4 text-sm font-medium text-gray-500">Match Score</td>
                {candidates.map((candidate) => (
                  <td key={candidate.candidateId} className="px-4 py-4">
                    <ScoreBar score={candidate.matchScore} />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 text-sm font-medium text-gray-500">Strengths</td>
                {candidates.map((candidate) => (
                  <td key={candidate.candidateId} className="px-4 py-4 align-top">
                    <div className="rounded-xl bg-green-50 p-3 text-sm text-gray-700">
                      {candidate.strengths}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 text-sm font-medium text-gray-500">Gaps</td>
                {candidates.map((candidate) => (
                  <td key={candidate.candidateId} className="px-4 py-4 align-top">
                    <div className="rounded-xl bg-orange-50 p-3 text-sm text-gray-700">
                      {candidate.gaps}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 text-sm font-medium text-gray-500">Recommendation</td>
                {candidates.map((candidate) => (
                  <td key={candidate.candidateId} className="px-4 py-4 align-top">
                    <div className="rounded-xl bg-blue-50 p-3 text-sm text-gray-700">
                      {candidate.recommendation}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
