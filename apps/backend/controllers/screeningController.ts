import { NextFunction, Request, Response } from "express";
import { runGeminiScreening } from "../ai/services/geminiService";
import { buildFinalShortlist } from "../ai/services/rankingService";
import { filterCandidates } from "../ai/services/scoringService";
import { CandidateInput, JobInput } from "../ai/types/aiTypes";
import { createError } from "../middleware/errorHandler";
import { Applicant } from "../models/Applicant";
import { Job } from "../models/Job";
import { ScreeningResult } from "../models/ScreeningResult";

export const triggerScreening = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      throw createError("Job not found", 404);
    }

    const applicants = await Applicant.find({ jobId }).sort({ createdAt: -1 });

    if (applicants.length === 0) {
      throw createError("No applicants found for this job", 400);
    }

    const jobInput: JobInput = {
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      skills: job.skills,
      experienceYears: job.experienceYears,
      educationLevel: job.educationLevel,
      location: job.location,
      shortlistSize: job.shortlistSize,
    };

    const candidateInputs: CandidateInput[] = applicants.map((applicant) => ({
      _id: String(applicant._id),
      name: applicant.name,
      email: applicant.email,
      skills: applicant.skills,
      experienceYears: applicant.experienceYears,
      education: applicant.education,
      currentRole: applicant.currentRole,
      summary: applicant.summary,
      resumeText: applicant.resumeText,
      source: applicant.source,
    }));

    const qualifiedCandidates = filterCandidates(candidateInputs, jobInput);

    if (qualifiedCandidates.length === 0) {
      throw createError("No candidates met the minimum qualification threshold", 400);
    }

    const geminiResults = await runGeminiScreening(
      jobInput,
      qualifiedCandidates,
      job.shortlistSize,
    );
    const shortlist = buildFinalShortlist(geminiResults, job.shortlistSize);

    await ScreeningResult.findOneAndUpdate(
      { jobId },
      {
        jobId,
        shortlist,
        totalApplicants: applicants.length,
        shortlistSize: shortlist.length,
        processedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.json({
      success: true,
      message: `Screening complete. ${shortlist.length} candidates shortlisted from ${applicants.length} total.`,
      data: shortlist,
    });
  } catch (error) {
    const typedError = error as { statusCode?: number; name?: string; message?: string };

    if (typedError.statusCode || typedError.name === "CastError") {
      next(error);
      return;
    }

    next(createError(`AI screening failed: ${typedError.message || "Unknown error"}`, 502));
  }
};

export const getScreeningResults = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await ScreeningResult.findOne({ jobId: req.params.jobId }).populate(
      "jobId",
      "title description",
    );

    if (!result) {
      throw createError("No screening results found", 404);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const clearScreeningResults = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await ScreeningResult.findOneAndDelete({ jobId: req.params.jobId });

    res.json({
      success: true,
      message: "Screening results cleared",
    });
  } catch (error) {
    next(error);
  }
};
