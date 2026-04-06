import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  experienceYears: number;
  educationLevel: string;
  location?: string;
  shortlistSize: 10 | 20;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    requirements: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    experienceYears: { type: Number, required: true, default: 0, min: 0 },
    educationLevel: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    shortlistSize: { type: Number, enum: [10, 20], default: 10 },
  },
  { timestamps: true },
);

export const Job = mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);
