"use client";

import type { ScoringWeights } from "@/types";

interface WeightsSliderProps {
  weights: ScoringWeights;
  onChange: (weights: ScoringWeights) => void;
  onReset: () => void;
}

const LABELS: { key: keyof ScoringWeights; label: string }[] = [
  { key: "skills", label: "Skills Match" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "profile", label: "Profile Quality" },
];

export default function WeightsSlider({
  weights,
  onChange,
  onReset,
}: WeightsSliderProps) {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);

  const updateWeight = (key: keyof ScoringWeights, value: number) => {
    onChange({ ...weights, [key]: value });
  };

  return (
    <div className="w-full min-w-0 max-w-full rounded-xl border border-gray-100 bg-white p-3 shadow-md sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[#3b82f6] sm:text-lg">Adjustable Scoring Weights</h2>
          <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
            Tune how much the AI values skills, experience, education, and profile quality.
          </p>
        </div>

        <div
          className={`self-start rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide sm:px-3 sm:text-xs ${
            total === 100
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          Total: {total}%
        </div>
      </div>

      <div className="min-w-0 max-w-full grid gap-3 md:grid-cols-2">
        {LABELS.map(({ key, label }) => (
          <div key={key} className="rounded-xl border border-gray-100 bg-gray-50 p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-gray-700 sm:text-sm">{label}</span>
              <span className="text-xs font-semibold text-[#3b82f6] sm:text-sm">{weights[key]}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={weights[key]}
              onChange={(event) => updateWeight(key, Number(event.target.value))}
              className="w-full accent-[#3b82f6]"
            />
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] leading-5 text-gray-400 sm:text-xs">
          The total must stay at 100% before screening can run.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] font-medium text-gray-500 underline underline-offset-2 hover:text-gray-700 sm:text-xs"
        >
          Reset defaults
        </button>
      </div>
    </div>
  );
}
