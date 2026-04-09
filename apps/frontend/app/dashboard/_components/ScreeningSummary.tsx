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
    <div className="rounded-xl bg-gradient-to-r from-[#3b82f6] to-blue-700 p-4 sm:p-6 text-white shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
            Screening Summary
          </p>
          <h2 className="mt-2 text-2xl font-bold">Shortlist insights at a glance</h2>
        </div>
        <p className="text-sm text-blue-100">
          Processed {new Date(result.processedAt).toLocaleString()}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-blue-200">Total Screened</p>
          <p className="mt-1 text-3xl font-bold">{result.totalApplicants}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-blue-200">Shortlisted</p>
          <p className="mt-1 text-3xl font-bold">{shortlist.length}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-blue-200">Avg Match Score</p>
          <p className="mt-1 text-3xl font-bold">{avgScore}%</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-blue-200">Strong Matches</p>
          <p className="mt-1 text-3xl font-bold text-green-300">{strongMatches}</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/10 p-4">
        <p className="text-sm text-blue-100">
          Top candidate:
          <span className="ml-2 font-semibold text-white">
            {topCandidate.candidateName}
          </span>
        </p>
        <p className="mt-1 text-sm text-blue-100">
          Match score:
          <span className="ml-2 font-semibold text-green-300">
            {topCandidate.matchScore}/100
          </span>
        </p>
      </div>
    </div>
  );
}
