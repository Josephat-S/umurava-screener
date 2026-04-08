"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Loading applicant profiles",
  "Analyzing skills and experience",
  "Scoring against job requirements",
  "Ranking candidates with AI",
  "Generating recruiter explanations",
  "Building shortlist",
];

export default function ScreeningProgress() {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentStep((previous) => Math.min(previous + 1, STEPS.length));
    }, 2500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-blue-900">
            AI screening is in progress
          </h3>
          <p className="mt-1 text-sm text-blue-700">
            We are making the ranking steps visible so the process feels transparent.
          </p>
        </div>
        <div className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
          Step {currentStep}/{STEPS.length}
        </div>
      </div>

      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isDone = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <div
              key={step}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                isDone
                  ? "border-green-200 bg-green-50"
                  : isActive
                    ? "border-blue-200 bg-white shadow-sm"
                    : "border-transparent bg-blue-100/60 opacity-60"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  isDone
                    ? "bg-green-600 text-white"
                    : isActive
                      ? "bg-[#3b82f6] text-white"
                      : "bg-white text-blue-500"
                }`}
              >
                {isDone ? "OK" : stepNumber}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    isDone
                      ? "text-green-800"
                      : isActive
                        ? "text-blue-900"
                        : "text-blue-600"
                  }`}
                >
                  {step}
                </p>
              </div>
              {isActive && (
                <svg className="h-4 w-4 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}