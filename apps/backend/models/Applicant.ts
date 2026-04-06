import mongoose, { Document, Schema } from "mongoose";

export interface IApplicant extends Document {
  jobId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  skills: string[];
  experienceYears: number;
  education: string;
  currentRole?: string;
  summary?: string;
  resumeText?: string;
  source: "platform" | "upload";
  createdAt: Date;
  updatedAt: Date;
}

const ApplicantSchema = new Schema<IApplicant>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    skills: { type: [String], default: [] },
    experienceYears: { type: Number, default: 0, min: 0 },
    education: { type: String, required: true, trim: true },
    currentRole: { type: String, trim: true },
    summary: { type: String, trim: true },
    resumeText: { type: String, trim: true },
    source: {
      type: String,
      enum: ["platform", "upload"],
      default: "platform",
      required: true,
    },
  },
  { timestamps: true },
);

export const Applicant =
  mongoose.models.Applicant ||
  mongoose.model<IApplicant>("Applicant", ApplicantSchema);
