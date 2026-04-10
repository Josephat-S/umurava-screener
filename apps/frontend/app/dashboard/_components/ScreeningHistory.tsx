import type { ScreeningResult } from "@/types";

interface ScreeningHistoryProps {
  result: ScreeningResult | null;
  screening: boolean;
  onRerun: () => void;
}

function timeAgo(dateValue: string): string {
  const diff = Date.now() - new Date(dateValue).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function ScreeningHistory({
  result,
  screening,
  onRerun,
}: ScreeningHistoryProps) {
  if (!result) {
    return null;
  }

  const recentRuns = result.history.slice(0, 4);

  return (
    <div className="w-full min-w-0 max-w-full rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          {/* Changed header text-gray-800 to text-[#3b82f6] */}
          <h2 className="text-lg font-bold text-[#3b82f6]">Screening History</h2>
          <p className="mt-1 break-words [overflow-wrap:anywhere] text-sm text-gray-500">
            Keep track of reruns as new applicants arrive.
          </p>
        </div>
        <button
          type="button"
          onClick={onRerun}
          disabled={screening}
          className="inline-flex w-full justify-center rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-[#3b82f6] transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-300 sm:w-auto sm:px-4 sm:text-sm"
        >
          Re-run screening
        </button>
      </div>

      <div className="mt-5 min-w-0 max-w-full grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {recentRuns.map((run) => (
          <div key={run.processedAt} className="min-w-0 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="min-w-0 break-words [overflow-wrap:anywhere] text-xs font-semibold uppercase tracking-wide text-gray-400">
              {timeAgo(run.processedAt)}
            </p>
            <p className="mt-2 min-w-0 break-words [overflow-wrap:anywhere] text-sm font-semibold text-gray-800">
              {run.totalApplicants} applicants screened
            </p>
            <p className="mt-1 min-w-0 break-words [overflow-wrap:anywhere] text-sm text-gray-500">
              {run.shortlistSize} shortlisted • Avg {run.avgMatchScore}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
