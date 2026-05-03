"use client";

import { useState } from "react";
import { X, Send, Mail, CheckCircle2 } from "lucide-react";
import { ScoredCandidate } from "@/types";

import { screeningService } from "@/services/screeningService";

interface EmailModalProps {
  jobId: string;
  candidate: ScoredCandidate;
  jobTitle: string;
  onClose: () => void;
}

export default function EmailModal({
  jobId,
  candidate,
  jobTitle,
  onClose,
}: EmailModalProps) {
  const [subject, setSubject] = useState(`Update regarding your application for ${jobTitle}`);
  const [body, setBody] = useState(`Hi ${candidate.candidateName},\n\nThank you for your interest in the ${jobTitle} position at Umurava.\n\n[Add your message here]\n\nBest regards,\nThe Umurava Hiring Team`);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      await screeningService.sendCandidateEmail(
        jobId,
        candidate.candidateId,
        subject,
        body,
      );
      setIsSent(true);
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error("Failed to send email", error);
    } finally {
      setIsSending(false);
    }
  };

  const useTemplate = (type: "invite" | "rejection") => {
    if (type === "invite") {
      setSubject(`Interview Invitation: ${jobTitle} at Umurava`);
      setBody(`Hi ${candidate.candidateName},\n\nGreat news! Our AI-powered screening has highlighted you as a top candidate for the ${jobTitle} role.\n\nWe would love to schedule a technical interview to learn more about your experience.\n\nPlease let us know your availability for a 45-minute call next week.\n\nBest regards,\nThe Umurava Hiring Team`);
    } else {
      setSubject(`Update regarding your application for ${jobTitle}`);
      setBody(`Hi ${candidate.candidateName},\n\nThank you for taking the time to apply for the ${jobTitle} position.\n\nAfter review, we've decided to move forward with other candidates at this time.\n\n${candidate.gaps ? `Our AI analysis noted: ${candidate.gaps}` : ""}\n\nWe wish you the best in your search.\n\nBest regards,\nThe Umurava Hiring Team`);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2 text-[#3b82f6]">
            <Mail className="h-5 w-5" />
            <h2 className="text-lg font-bold">Send Email to {candidate.candidateName}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {isSent ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-green-100 p-3 text-green-600">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Email Sent!</h3>
              <p className="mt-2 text-gray-500">Your message has been delivered to {candidate.candidateName}.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => useTemplate("invite")}
                  className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                >
                  Use Interview Template
                </button>
                <button
                  onClick={() => useTemplate("rejection")}
                  className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 transition-colors hover:bg-orange-100"
                >
                  Use Rejection Template
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Message Body</label>
                <textarea
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="flex items-center gap-2 rounded-xl bg-[#3b82f6] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSending ? "Sending..." : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
