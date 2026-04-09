import type { ScoredCandidate, ScreeningResult } from "@/types";

interface ScreeningSummaryProps {
  result: ScreeningResult;
  shortlist: ScoredCandidate[];
}

export default function ScreeningSummary({
  result,
  shortlist,
}: ScreeningSummaryProps) {
  if (shortlist.length === 0) {
    return null;
  }

  const avgScore = Math.round(
    shortlist.reduce((sum, candidate) => sum + candidate.matchScore, 0) /
      shortlist.length,
  );
  const topCandidate = shortlist[0];
  const strongMatches = shortlist.filter((candidate) => candidate.matchScore >= 70).length;

  return (
    <div className="w-full min-w-0 max-w-full rounded-xl bg-gradient-to-r from-[#3b82f6] to-blue-700 p-3 text-white shadow-md transition-shadow duration-200 hover:shadow-lg sm:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200 sm:text-xs">
            Screening Summary
          </p>
          <h2 className="mt-1 text-lg font-bold sm:mt-2 sm:text-2xl">Shortlist insights at a glance</h2>
        </div>
        <p className="break-words [overflow-wrap:anywhere] text-xs text-blue-100 sm:text-sm">
          Processed {new Date(result.processedAt).toLocaleString()}
        </p>
      </div>

      <div className="mt-4 min-w-0 max-w-full grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-blue-200 sm:text-xs">Total Screened</p>
          <p className="mt-1 text-2xl font-bold sm:text-3xl">{result.totalApplicants}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-blue-200 sm:text-xs">Shortlisted</p>
          <p className="mt-1 text-2xl font-bold sm:text-3xl">{shortlist.length}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-blue-200 sm:text-xs">Avg Match Score</p>
          <p className="mt-1 text-2xl font-bold sm:text-3xl">{avgScore}%</p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-blue-200 sm:text-xs">Strong Matches</p>
          <p className="mt-1 text-2xl font-bold text-green-300 sm:text-3xl">{strongMatches}</p>
        </div>
      </div>

      <div className="mt-4 min-w-0 max-w-full rounded-xl border border-white/10 bg-white/10 p-3 sm:mt-6 sm:p-4">
        <p className="min-w-0 text-xs text-blue-100 sm:text-sm">
          Top candidate:
          <span className="ml-2 block break-words [overflow-wrap:anywhere] font-semibold text-white">
            {topCandidate.candidateName}
          </span>
        </p>
        <p className="mt-1 text-xs text-blue-100 sm:text-sm">
          Match score:
          <span className="ml-2 font-semibold text-green-300">
            {topCandidate.matchScore}/100
          </span>
        </p>
      </div>
    </div>
  );
}
