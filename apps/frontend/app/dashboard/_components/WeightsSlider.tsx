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
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-md sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#3b82f6]">Adjustable Scoring Weights</h2>
          <p className="mt-1 text-sm text-gray-500">
            Tune how much the AI values skills, experience, education, and profile quality.
          </p>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            total === 100
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          Total: {total}%
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {LABELS.map(({ key, label }) => (
          <div key={key} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <span className="text-sm font-semibold text-[#3b82f6]">{weights[key]}%</span>
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

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-400">
          The total must stay at 100% before screening can run.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-gray-500 underline underline-offset-2 hover:text-gray-700"
        >
          Reset defaults
        </button>
      </div>
    </div>
  );
}
