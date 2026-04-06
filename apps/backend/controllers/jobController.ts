import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ScreeningResult } from "../models/ScreeningResult";
import { Applicant } from "../models/Applicant";
import { Job } from "../models/Job";
import { createError } from "../middleware/errorHandler";

const normalizeStringArray = (values: string[]) =>
  values.map((value) => value.trim()).filter(Boolean);

const JobSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  requirements: z.array(z.string()).default([]).transform(normalizeStringArray),
  skills: z.array(z.string()).default([]).transform(normalizeStringArray),
  experienceYears: z.coerce.number().min(0),
  educationLevel: z.string().trim().min(1),
  location: z.string().trim().min(1).optional(),
  shortlistSize: z.coerce.number().refine((value) => value === 10 || value === 20, {
    message: "shortlistSize must be 10 or 20",
  }).default(10),
});

const UpdateJobSchema = JobSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required",
);

export const createJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = JobSchema.parse(req.body);
    const job = await Job.create(payload);

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      throw createError("Job not found", 404);
    }

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = UpdateJobSchema.parse(req.body);
    const job = await Job.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      throw createError("Job not found", 404);
    }

    res.json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      throw createError("Job not found", 404);
    }

    await Promise.all([
      Applicant.deleteMany({ jobId: req.params.id }),
      ScreeningResult.deleteOne({ jobId: req.params.id }),
    ]);

    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
