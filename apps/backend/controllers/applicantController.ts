import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { ScoredCandidate } from "../ai/types/aiTypes";
import {
  parsePDFResumes,
  parseResumeLinks,
  parseSpreadsheet,
} from "../ai/services/parserService";
import { checkProfileCompleteness } from "../ai/services/scoringService";
import { createError } from "../middleware/errorHandler";
import { Applicant } from "../models/Applicant";
import { Job } from "../models/Job";
import { ScreeningResult } from "../models/ScreeningResult";

const normalizeStringArray = (values: string[]) =>
  values.map((value) => value.trim()).filter(Boolean);

const ApplicantPayloadSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().email(),
  headline: z.string().trim().min(1),
  bio: z.string().trim().optional(),
  location: z.string().trim().min(1),
  skills: z.array(z.object({
    name: z.string().trim().min(1),
    level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
    yearsOfExperience: z.number().min(0),
  })).min(1),
  languages: z.array(z.object({
    name: z.string().trim().min(1),
    proficiency: z.enum(["Basic", "Conversational", "Fluent", "Native"]),
  })).optional(),
  experience: z.array(z.object({
    company: z.string().trim().min(1),
    role: z.string().trim().min(1),
    startDate: z.string().trim().min(1),
    endDate: z.string().trim().min(1),
    description: z.string().trim().min(1),
    technologies: z.array(z.string()).default([]),
    isCurrent: z.boolean().default(false),
  })).min(1),
  education: z.array(z.object({
    institution: z.string().trim().min(1),
    degree: z.string().trim().min(1),
    fieldOfStudy: z.string().trim().min(1),
    startYear: z.number().int(),
    endYear: z.number().int(),
  })).min(1),
  certifications: z.array(z.object({
    name: z.string().trim().min(1),
    issuer: z.string().trim().min(1),
    issueDate: z.string().trim().min(1),
  })).optional(),
  projects: z.array(z.object({
    name: z.string().trim().min(1),
    description: z.string().trim().min(1),
    technologies: z.array(z.string()).default([]),
    role: z.string().trim().min(1),
    link: z.string().trim().url(),
    startDate: z.string().trim().min(1),
    endDate: z.string().trim().min(1),
  })).min(1),
  availability: z.object({
    status: z.enum(["Available", "Open to Opportunities", "Not Available"]),
    type: z.enum(["Full-time", "Part-time", "Contract"]),
    startDate: z.string().trim().optional(),
  }),
  socialLinks: z.object({
    linkedin: z.string().trim().url().optional(),
    github: z.string().trim().url().optional(),
    portfolio: z.string().trim().url().optional(),
  }).optional(),
  resumeText: z.string().trim().optional(),
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
  firstName: applicant.firstName?.trim() || "Candidate",
  lastName: applicant.lastName?.trim() || String(index + 1),
  email: applicant.email?.trim() || `uploaded-${Date.now()}-${index}@placeholder.local`,
  headline: applicant.headline?.trim() || "Professional",
  bio: applicant.bio?.trim() || undefined,
  location: applicant.location?.trim() || "Remote",
  skills: applicant.skills || [],
  languages: applicant.languages || [],
  experience: applicant.experience || [],
  education: applicant.education || [],
  certifications: applicant.certifications || [],
  projects: applicant.projects || [],
  availability: applicant.availability || { status: "Open to Opportunities", type: "Full-time" },
  socialLinks: applicant.socialLinks || {},
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
    const errors: string[] = [];

    const pdfFiles = files.filter((file) => file.mimetype === "application/pdf");
    const spreadsheetFiles = files.filter(
      (file) => file.mimetype !== "application/pdf",
    );

    if (pdfFiles.length > 0) {
      try {
        const parsedPDFApplicants = await parsePDFResumes(pdfFiles);
        parsedApplicants.push(
          ...parsedPDFApplicants.map((applicant, index) =>
            sanitizeParsedApplicant(applicant, parsedApplicants.length + index),
          ),
        );
      } catch (error) {
        errors.push(`PDF parsing failed: ${(error as Error).message}`);
      }
    }

    for (const file of spreadsheetFiles) {
      try {
        const parsedSpreadsheetApplicants = parseSpreadsheet(file.buffer);
        parsedApplicants.push(
          ...parsedSpreadsheetApplicants.map((applicant, index) =>
            sanitizeParsedApplicant(applicant, parsedApplicants.length + index),
          ),
        );
      } catch (error) {
        errors.push(`Spreadsheet (${file.originalname}) parsing failed: ${(error as Error).message}`);
      }
    }

    if (resumeLinks.length > 0) {
      try {
        const parsedLinkedApplicants = await parseResumeLinks(resumeLinks);
        parsedApplicants.push(
          ...parsedLinkedApplicants.map((applicant, index) =>
            sanitizeParsedApplicant(applicant, parsedApplicants.length + index),
          ),
        );
      } catch (error) {
        errors.push(`Resume link parsing failed: ${(error as Error).message}`);
      }
    }

    if (parsedApplicants.length === 0) {
      const errorMsg = errors.length > 0
        ? `Import failed: ${errors.join(" | ")}`
        : "The provided files or resume links did not contain any applicants";
      throw createError(errorMsg, 422);
    }

    const docs = parsedApplicants.map((applicant) => {
      const completeness = checkProfileCompleteness(applicant as any);
      return {
        ...applicant,
        jobId,
        source: "upload" as const,
        isIncomplete: completeness.isIncomplete,
        incompletenessReason: completeness.reason,
      };
    });

    const savedApplicants = await Applicant.insertMany(docs);

    res.status(201).json({
      success: true,
      message: `${savedApplicants.length} applicants imported successfully.${
        errors.length > 0 ? ` Some errors occurred: ${errors.join(" | ")}` : ""
      }`,
      data: savedApplicants,
      count: savedApplicants.length,
      errors: errors.length > 0 ? errors : undefined,
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
