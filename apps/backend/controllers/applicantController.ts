import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { ScoredCandidate } from "../ai/types/aiTypes";
import {
  parsePDFResumes,
  parseResumeLinks,
  parseSpreadsheet,
} from "../ai/services/parserService";
import { createError } from "../middleware/errorHandler";
import { Applicant } from "../models/Applicant";
import { Job } from "../models/Job";
import { ScreeningResult } from "../models/ScreeningResult";

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

const UploadApplicantsSchema = z.object({
  jobId: z.string().trim().min(1),
  resumeLinks: z.preprocess(
    (value) => {
      if (Array.isArray(value)) {
        return value;
      }

      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed ? [trimmed] : [];
      }

      return [];
    },
    z
      .array(z.string().trim().url("Resume links must be valid URLs"))
      .default([])
      .transform((links) => Array.from(new Set(links))),
  ),
});

const JobParamsSchema = z.object({
  jobId: z.string().trim().min(1),
});

const ApplicantDeleteParamsSchema = z.object({
  jobId: z.string().trim().min(1),
  applicantId: z.string().trim().min(1),
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

const ensureJobExists = async (jobId: string): Promise<void> => {
  const jobExists = await Job.exists({ _id: jobId });

  if (!jobExists) {
    throw createError("Job not found", 404);
  }
};

const syncScreeningResultAfterApplicantRemoval = async (
  jobId: string,
  removedApplicantIds: string[],
): Promise<void> => {
  if (removedApplicantIds.length === 0) {
    return;
  }

  const screeningResult = await ScreeningResult.findOne({ jobId });

  if (!screeningResult) {
    return;
  }

  const removedIdSet = new Set(removedApplicantIds);
  screeningResult.shortlist = screeningResult.shortlist
    .filter((candidate: ScoredCandidate) => !removedIdSet.has(candidate.candidateId))
    .map((candidate: ScoredCandidate, index: number) => ({
      ...candidate,
      rank: index + 1,
    }));
  screeningResult.shortlistSize = screeningResult.shortlist.length;
  screeningResult.totalApplicants = await Applicant.countDocuments({ jobId });
  screeningResult.processedAt = new Date();
  await screeningResult.save();
};

export const addApplicants = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { jobId, applicants } = AddApplicantsSchema.parse(req.body);
    await ensureJobExists(jobId);

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
    const { jobId, resumeLinks } = UploadApplicantsSchema.parse(req.body);
    await ensureJobExists(jobId);

    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    if (files.length === 0 && resumeLinks.length === 0) {
      throw createError("Upload files or provide at least one resume link", 400);
    }

    const parsedApplicants: Array<ReturnType<typeof sanitizeParsedApplicant>> = [];
    const pdfFiles = files.filter((file) => file.mimetype === "application/pdf");
    const spreadsheetFiles = files.filter(
      (file) => file.mimetype !== "application/pdf",
    );

    if (pdfFiles.length > 0) {
      const parsedPDFApplicants = await parsePDFResumes(pdfFiles);
      parsedApplicants.push(
        ...parsedPDFApplicants.map((applicant, index) =>
          sanitizeParsedApplicant(applicant, parsedApplicants.length + index),
        ),
      );
    }

    for (const file of spreadsheetFiles) {
      const parsedSpreadsheetApplicants = parseSpreadsheet(file.buffer);
      parsedApplicants.push(
        ...parsedSpreadsheetApplicants.map((applicant, index) =>
          sanitizeParsedApplicant(applicant, parsedApplicants.length + index),
        ),
      );
    }

    if (resumeLinks.length > 0) {
      const parsedLinkedApplicants = await parseResumeLinks(resumeLinks);
      parsedApplicants.push(
        ...parsedLinkedApplicants.map((applicant, index) =>
          sanitizeParsedApplicant(applicant, parsedApplicants.length + index),
        ),
      );
    }

    if (parsedApplicants.length === 0) {
      throw createError("The provided files or resume links did not contain any applicants", 422);
    }

    const docs = parsedApplicants.map((applicant) => ({
      ...applicant,
      jobId,
      source: "upload" as const,
    }));

    const savedApplicants = await Applicant.insertMany(docs);

    res.status(201).json({
      success: true,
      message: `${savedApplicants.length} applicants imported successfully`,
      data: savedApplicants,
      count: savedApplicants.length,
    });
  } catch (error) {
    const typedError = error as { statusCode?: number; name?: string; message?: string };

    if (typedError.statusCode || typedError.name === "ZodError" || typedError.name === "CastError") {
      next(error);
      return;
    }

    next(createError(typedError.message || "Failed to parse imported applicants", 422));
  }
};

export const getApplicantsByJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { jobId } = JobParamsSchema.parse(req.params);
    const applicants = await Applicant.find({ jobId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: applicants,
      count: applicants.length,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApplicantById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { jobId, applicantId } = ApplicantDeleteParamsSchema.parse(req.params);
    await ensureJobExists(jobId);

    const applicant = await Applicant.findOneAndDelete({
      _id: applicantId,
      jobId,
    });

    if (!applicant) {
      throw createError("Applicant not found for this job", 404);
    }

    await syncScreeningResultAfterApplicantRemoval(jobId, [String(applicant._id)]);

    res.json({
      success: true,
      message: "Applicant deleted successfully",
      data: { applicantId: String(applicant._id) },
    });
  } catch (error) {
    next(error);
  }
};

export const clearApplicantsByJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { jobId } = JobParamsSchema.parse(req.params);
    await ensureJobExists(jobId);

    const applicants = await Applicant.find({ jobId }).select("_id").lean();
    const removedApplicantIds = applicants.map((applicant) => String(applicant._id));

    if (removedApplicantIds.length === 0) {
      res.json({
        success: true,
        message: "No applicants to delete for this job",
        data: { deletedCount: 0 },
        count: 0,
      });
      return;
    }

    await Applicant.deleteMany({ jobId });
    await syncScreeningResultAfterApplicantRemoval(jobId, removedApplicantIds);

    res.json({
      success: true,
      message: `${removedApplicantIds.length} applicants deleted successfully`,
      data: { deletedCount: removedApplicantIds.length },
      count: removedApplicantIds.length,
    });
  } catch (error) {
    next(error);
  }
};
