import mongoose, { Document, Schema } from "mongoose";
import { ScoredCandidate } from "../ai/types/aiTypes";

export interface IScreeningResult extends Document {
  jobId: mongoose.Types.ObjectId;
  shortlist: ScoredCandidate[];
  totalApplicants: number;
  shortlistSize: number;
  processedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ScoredCandidateSchema = new Schema<ScoredCandidate>(
  {
    rank: { type: Number, required: true, min: 1 },
    candidateId: { type: String, required: true },
    candidateName: { type: String, required: true },
    matchScore: { type: Number, required: true, min: 0, max: 100 },
    strengths: { type: String, required: true, trim: true },
    gaps: { type: String, required: true, trim: true },
    recommendation: { type: String, required: true, trim: true },
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
  },
  { timestamps: true },
);

export const ScreeningResult =
  mongoose.models.ScreeningResult ||
  mongoose.model<IScreeningResult>("ScreeningResult", ScreeningResultSchema);
