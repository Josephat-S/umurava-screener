import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { parsePDFResumes, parseSpreadsheet } from "../ai/services/parserService";
import { createError } from "../middleware/errorHandler";
import { Applicant } from "../models/Applicant";
import { Job } from "../models/Job";

const normalizeStringArray = (values: string[]) =>
  values.map((value) => value.trim()).filter(Boolean);

const ApplicantPayloadSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  skills: z.array(z.string()).default([]).transform(normalizeStringArray),
  experienceYears: z.coerce.number().min(0).default(0),
  education: z.string().trim().min(1),
  currentRole: z.string().trim().min(1).optional(),
  summary: z.string().trim().min(1).optional(),
  resumeText: z.string().trim().min(1).optional(),
});

const AddApplicantsSchema = z.object({
  jobId: z.string().trim().min(1),
  applicants: z.array(ApplicantPayloadSchema).min(1),
});

const sanitizeParsedApplicant = (
  applicant: Partial<z.infer<typeof ApplicantPayloadSchema>>,
  index: number,
) => ({
  name: applicant.name?.trim() || `Uploaded Candidate ${index + 1}`,
  email: applicant.email?.trim() || `uploaded-${Date.now()}-${index}@placeholder.local`,
  skills: applicant.skills?.map((skill) => skill.trim()).filter(Boolean) || [],
  experienceYears: applicant.experienceYears ?? 0,
  education: applicant.education?.trim() || "Not provided",
  currentRole: applicant.currentRole?.trim() || undefined,
  summary: applicant.summary?.trim() || undefined,
  resumeText: applicant.resumeText?.trim() || undefined,
});

export const addApplicants = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { jobId, applicants } = AddApplicantsSchema.parse(req.body);
    const jobExists = await Job.exists({ _id: jobId });

    if (!jobExists) {
      throw createError("Job not found", 404);
    }

    const docs = applicants.map((applicant) => ({
      ...applicant,
      jobId,
      source: "platform" as const,
    }));

    const savedApplicants = await Applicant.insertMany(docs);

    res.status(201).json({
      success: true,
      message: `${savedApplicants.length} applicants added successfully`,
      data: savedApplicants,
      count: savedApplicants.length,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadApplicants = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const jobId = z.string().trim().min(1).parse(req.body.jobId);
    const jobExists = await Job.exists({ _id: jobId });

    if (!jobExists) {
      throw createError("Job not found", 404);
    }

    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    if (files.length === 0) {
      throw createError("No files uploaded", 400);
    }

    const parsedApplicants: Array<ReturnType<typeof sanitizeParsedApplicant>> = [];

    for (const file of files) {
      if (file.mimetype === "application/pdf") {
        const parsedPDFApplicants = await parsePDFResumes([file]);
        parsedApplicants.push(
          ...parsedPDFApplicants.map((applicant, index) =>
            sanitizeParsedApplicant(applicant, parsedApplicants.length + index),
          ),
        );
      } else {
        const parsedSpreadsheetApplicants = parseSpreadsheet(file.buffer);
        parsedApplicants.push(
          ...parsedSpreadsheetApplicants.map((applicant, index) =>
            sanitizeParsedApplicant(applicant, parsedApplicants.length + index),
          ),
        );
      }
    }

    if (parsedApplicants.length === 0) {
      throw createError("The uploaded files did not contain any applicants", 422);
    }

    const docs = parsedApplicants.map((applicant) => ({
      ...applicant,
      jobId,
      source: "upload" as const,
    }));

    const savedApplicants = await Applicant.insertMany(docs);

    res.status(201).json({
      success: true,
      message: `${savedApplicants.length} applicants uploaded successfully`,
      data: savedApplicants,
      count: savedApplicants.length,
    });
  } catch (error) {
    const typedError = error as { statusCode?: number; name?: string; message?: string };

    if (typedError.statusCode || typedError.name === "ZodError" || typedError.name === "CastError") {
      next(error);
      return;
    }

    next(createError(typedError.message || "Failed to parse uploaded applicants", 422));
  }
};

export const getApplicantsByJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const applicants = await Applicant.find({ jobId: req.params.jobId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: applicants,
      count: applicants.length,
    });
  } catch (error) {
    next(error);
  }
};
