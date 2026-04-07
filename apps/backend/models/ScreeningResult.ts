import mongoose, { Document, Schema } from "mongoose";
import {
  CandidateStatus,
  ConfidenceLevel,
  ScoredCandidate,
  ScoringWeights,
  ScreeningHistoryEntry,
} from "../ai/types/aiTypes";

export interface IScreeningResult extends Document {
  jobId: mongoose.Types.ObjectId;
  shortlist: ScoredCandidate[];
  totalApplicants: number;
  shortlistSize: number;
  processedAt: Date;
  lastUsedWeights: ScoringWeights;
  history: ScreeningHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const WeightsSchema = new Schema<ScoringWeights>(
  {
    skills: { type: Number, required: true, min: 0, max: 100 },
    experience: { type: Number, required: true, min: 0, max: 100 },
    education: { type: Number, required: true, min: 0, max: 100 },
    profile: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false },
);

const ScoredCandidateSchema = new Schema<ScoredCandidate>(
  {
    rank: { type: Number, required: true, min: 1 },
    candidateId: { type: String, required: true },
    candidateName: { type: String, required: true },
    matchScore: { type: Number, required: true, min: 0, max: 100 },
    strengths: { type: String, required: true, trim: true },
    gaps: { type: String, required: true, trim: true },
    recommendation: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: [
        "shortlisted",
        "interview",
        "offer",
        "hired",
        "rejected",
      ] satisfies CandidateStatus[],
      default: "shortlisted",
    },
    source: {
      type: String,
      enum: ["platform", "upload"],
    },
    confidenceLevel: {
      type: String,
      enum: ["high", "medium", "low"] satisfies ConfidenceLevel[],
      default: "medium",
    },
    confidenceReason: { type: String, trim: true },
  },
  { _id: false },
);

const ScreeningHistorySchema = new Schema<ScreeningHistoryEntry>(
  {
    processedAt: { type: Date, required: true, default: Date.now },
    totalApplicants: { type: Number, required: true, min: 0 },
    shortlistSize: { type: Number, required: true, min: 0 },
    avgMatchScore: { type: Number, required: true, min: 0, max: 100 },
    weights: { type: WeightsSchema, required: true },
  },
  { _id: false },
);

const ScreeningResultSchema = new Schema<IScreeningResult>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      unique: true,
      index: true,
    },
    shortlist: { type: [ScoredCandidateSchema], default: [] },
    totalApplicants: { type: Number, required: true, min: 0 },
    shortlistSize: { type: Number, required: true, min: 0 },
    processedAt: { type: Date, default: Date.now },
    lastUsedWeights: {
      type: WeightsSchema,
      default: {
        skills: 40,
        experience: 30,
        education: 15,
        profile: 15,
      },
    },
    history: { type: [ScreeningHistorySchema], default: [] },
  },
  { timestamps: true },
);

export const ScreeningResult =
  mongoose.models.ScreeningResult ||
  mongoose.model<IScreeningResult>("ScreeningResult", ScreeningResultSchema);
