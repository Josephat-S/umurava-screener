"use client";

import toast from "react-hot-toast";
import {
  fetchScreeningResults,
  triggerScreening,
} from "@/store/slices/screeningSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface ScreeningActionButtonProps {
  jobId: string;
  disabled?: boolean;
}

export default function ScreeningActionButton({
  jobId,
  disabled = false,
}: ScreeningActionButtonProps) {
  const dispatch = useAppDispatch();
  const { screening } = useAppSelector((state) => state.screening);

  const handleClick = async () => {
    try {
      await dispatch(triggerScreening(jobId)).unwrap();
      await dispatch(fetchScreeningResults(jobId)).unwrap();
      toast.success("AI screening complete. The shortlist is ready.");
    } catch (error) {
      toast.error((error as Error).message || "Screening failed");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={screening || disabled}
      className="flex items-center gap-2 bg-[#260af5] hover:bg-[#1a05cc] disabled:bg-[#260af5]/40 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
    >
      {screening ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          Screening...
        </>
      ) : (
        <>
          <span className="text-base leading-none">AI</span>
          Run AI Screening
        </>
      )}
    </button>
  );
}
