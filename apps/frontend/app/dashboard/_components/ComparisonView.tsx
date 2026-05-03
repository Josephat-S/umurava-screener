"use client";

import { X, Sparkles, Loader2 } from "lucide-react";
import type { ScoredCandidate } from "@/types";
import { useState } from "react";
import { screeningService } from "@/services/screeningService";

interface ComparisonViewProps {
  jobId: string;
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
  jobId,
  candidates,
  onClose,
}: ComparisonViewProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateInsight = async () => {
    setIsLoading(true);
    try {
      const result = await screeningService.getComparisonInsight(
        jobId,
        candidates.map((c) => c.candidateId),
      );
      setInsight(result);
    } catch (error) {
      console.error("Failed to generate insight", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-x-hidden overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-5 sm:px-6">
          <div className="min-w-0">
            {/* Changed header text-gray-800 to text-[#3b82f6] */}
            <h2 className="text-xl font-bold text-[#3b82f6]">Candidate Comparison</h2>
            <p className="mt-1 break-words text-sm text-gray-500">
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

        <div className="w-full overflow-x-auto p-4 sm:p-6">
          <div className="mb-6 flex flex-col items-center justify-center rounded-2xl border border-blue-100 bg-blue-50/50 p-6 text-center">
            {insight ? (
              <div className="text-left">
                <div className="mb-3 flex items-center gap-2 text-[#3b82f6]">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="font-bold">AI Comparison Insight</h3>
                </div>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {insight}
                </div>
                <button
                  onClick={() => setInsight(null)}
                  className="mt-4 text-xs font-semibold text-[#3b82f6] hover:underline"
                >
                  Clear and Regenerate
                </button>
              </div>
            ) : (
              <>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-[#3b82f6]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Need a deeper analysis?</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Let Gemini analyze the nuances between these {candidates.length} candidates
                  to explain their ranking.
                </p>
                <button
                  onClick={generateInsight}
                  disabled={isLoading}
                  className="mt-5 flex items-center gap-2 rounded-xl bg-[#3b82f6] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing Candidates...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate AI Comparison Insight
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          <table className="min-w-[680px] w-full">
            <thead>
              <tr>
                <th className="w-40 pb-4 text-left text-sm font-semibold text-gray-500">
                  Criteria
                </th>
                {candidates.map((candidate) => (
                  <th key={candidate.candidateId} className="px-4 pb-4 text-left">
                    <div className="max-w-[14rem] break-words text-base font-semibold text-gray-800 sm:max-w-[18rem]">
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
                <td className="py-4 text-sm font-medium text-gray-500">
                  Profile Status
                </td>
                {candidates.map((candidate) => (
                  <td key={candidate.candidateId} className="px-4 py-4">
                    {candidate.isIncomplete ? (
                      <div className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 shadow-sm text-center">
                        Incomplete: {candidate.incompletenessReason}
                      </div>
                    ) : (
                      <div className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-600 shadow-sm text-center">
                        Complete Profile
                      </div>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 text-sm font-medium text-gray-500">Strengths</td>
                {candidates.map((candidate) => (
                  <td key={candidate.candidateId} className="px-4 py-4 align-top">
                    <div className="rounded-xl bg-green-50 p-3 text-sm text-gray-700 break-words">
                      {candidate.strengths}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 text-sm font-medium text-gray-500">Gaps</td>
                {candidates.map((candidate) => (
                  <td key={candidate.candidateId} className="px-4 py-4 align-top">
                    <div className="rounded-xl bg-orange-50 p-3 text-sm text-gray-700 break-words">
                      {candidate.gaps}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 text-sm font-medium text-gray-500">Recommendation</td>
                {candidates.map((candidate) => (
                  <td key={candidate.candidateId} className="px-4 py-4 align-top">
                    <div className="rounded-xl bg-blue-50 p-3 text-sm text-gray-700 break-words">
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
