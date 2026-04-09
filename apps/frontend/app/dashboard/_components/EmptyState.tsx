"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center shadow-sm sm:px-6 sm:py-14">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#3b82f6]">
        {icon}
      </div>
      {/* Changed header text-gray-800 to text-[#3b82f6] */}
      <h3 className="mt-5 text-lg font-semibold text-[#3b82f6]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md break-words text-sm text-gray-500">
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2563eb]"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2563eb]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}