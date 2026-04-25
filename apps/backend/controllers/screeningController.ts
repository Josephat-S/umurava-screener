import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { runGeminiScreening } from "../ai/services/geminiService";
import { buildFinalShortlist } from "../ai/services/rankingService";
import {
  DEFAULT_SCORING_WEIGHTS,
  filterCandidates,
  scoreCandidate,
} from "../ai/services/scoringService";
import {
  AnalyticsSummary,
  CandidateInput,
  CandidateStatus,
  JobInput,
  ScoredCandidate,
  ScoringWeights,
  ScreeningHistoryEntry,
} from "../ai/types/aiTypes";
import { createError } from "../middleware/errorHandler";
import { Applicant } from "../models/Applicant";
import { Job } from "../models/Job";
import { ScreeningResult } from "../models/ScreeningResult";

const WeightsSchema = z
  .object({
    skills: z.coerce.number().min(0).max(100).default(DEFAULT_SCORING_WEIGHTS.skills),
    experience: z.coerce.number().min(0).max(100).default(DEFAULT_SCORING_WEIGHTS.experience),
    education: z.coerce.number().min(0).max(100).default(DEFAULT_SCORING_WEIGHTS.education),
    profile: z.coerce.number().min(0).max(100).default(DEFAULT_SCORING_WEIGHTS.profile),
  })
  .refine(
    (weights) =>
      weights.skills +
        weights.experience +
        weights.education +
        weights.profile ===
      100,
    "Scoring weights must add up to 100",
  );

const CandidateStatusSchema = z.enum([
  "shortlisted",
  "interview",
  "offer",
  "hired",
  "rejected",
]);

function getWeightsFromRequest(body: unknown): ScoringWeights {
  const parsed = WeightsSchema.safeParse(
    typeof body === "object" && body !== null && "weights" in body
      ? (body as { weights?: unknown }).weights
      : DEFAULT_SCORING_WEIGHTS,
  );

  if (!parsed.success) {
    throw createError(parsed.error.issues[0]?.message || "Invalid screening weights", 400);
  }

  return parsed.data;
}

function getConfidence(candidate: CandidateInput): Pick<
  ScoredCandidate,
  "confidenceLevel" | "confidenceReason"
> {
  const hasStructuredData =
    candidate.skills.length > 0 ||
    Boolean(candidate.headline) ||
    candidate.experience.length > 0;

  if (candidate.source === "upload" && candidate.resumeText && !hasStructuredData) {
    return {
      confidenceLevel: "low",
      confidenceReason: "Based mostly on unstructured resume text.",
    };
  }

  if (candidate.source === "platform" && candidate.skills.length >= 2) {
    return {
      confidenceLevel: "high",
      confidenceReason: "Structured profile data gives the AI strong matching signals.",
    };
  }

  return {
    confidenceLevel: "medium",
    confidenceReason: "The profile has partial structured data, so the score should be reviewed.",
  };
}

function buildHistoryEntry(
  shortlist: ScoredCandidate[],
  totalApplicants: number,
  weights: ScoringWeights,
): ScreeningHistoryEntry {
  const avgMatchScore =
    shortlist.length > 0
      ? Math.round(
          shortlist.reduce((sum, candidate) => sum + candidate.matchScore, 0) /
            shortlist.length,
        )
      : 0;

  return {
    processedAt: new Date(),
    totalApplicants,
    shortlistSize: shortlist.length,
    avgMatchScore,
    weights,
  };
}

export const triggerScreening = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { jobId } = req.params;
    const weights = getWeightsFromRequest(req.body);
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
      firstName: applicant.firstName || "Candidate",
      lastName: applicant.lastName || "",
      email: applicant.email || "",
      headline: applicant.headline || "",
      bio: applicant.bio || "",
      location: applicant.location || "Unknown",
      skills: applicant.skills || [],
      languages: applicant.languages || [],
      experience: applicant.experience || [],
      education: applicant.education || [],
      certifications: applicant.certifications || [],
      projects: applicant.projects || [],
      availability: applicant.availability || {
        status: "Open to Opportunities",
        type: "Full-time",
      },
      socialLinks: applicant.socialLinks || {},
      resumeText: applicant.resumeText || "",
      source: applicant.source || "platform",
      isIncomplete: applicant.isIncomplete || false,
      incompletenessReason: applicant.incompletenessReason || "",
    }));

    const targetSize = job.shortlistSize || 10;
    let qualifiedCandidates = filterCandidates(
      candidateInputs,
      jobInput,
      undefined,
      weights,
    );

    // Requirement: If the number of qualified candidates is less than the requested shortlist size,
    // we include more candidates (sorted by their deterministic score) so the AI can fill the 
    // remaining spots with the "best of the rest", tagging incomplete profiles as requested.
    if (qualifiedCandidates.length < targetSize) {
      qualifiedCandidates = [...candidateInputs]
        .sort(
          (a, b) =>
            scoreCandidate(b, jobInput, weights).total -
            scoreCandidate(a, jobInput, weights).total,
        )
        .slice(0, 50);
    }

    if (qualifiedCandidates.length === 0) {
      throw createError("No applicants available for screening", 400);
    }

    const existingResult = await ScreeningResult.findOne({ jobId });
    const previousStatuses = new Map<string, CandidateStatus>(
      (existingResult?.shortlist || [])
        .filter((candidate: ScoredCandidate) => Boolean(candidate.status))
        .map((candidate: ScoredCandidate) => [
          candidate.candidateId,
          candidate.status || "shortlisted",
        ]),
    );
    const candidateMap = new Map(
      candidateInputs.map((candidate) => [candidate._id, candidate]),
    );

    const geminiResults = await runGeminiScreening(
      jobInput,
      qualifiedCandidates,
      job.shortlistSize,
      weights,
    );
    const shortlist = buildFinalShortlist(geminiResults, job.shortlistSize).map(
      (candidate: ScoredCandidate) => {
        const sourceCandidate = candidateMap.get(candidate.candidateId);
        const confidence = sourceCandidate ? getConfidence(sourceCandidate) : {};

        return {
          ...candidate,
          status: previousStatuses.get(candidate.candidateId) || "shortlisted",
          source: sourceCandidate?.source,
          ...confidence,
        };
      },
    );
    const historyEntry = buildHistoryEntry(shortlist, applicants.length, weights);

    await ScreeningResult.findOneAndUpdate(
      { jobId },
      {
        jobId,
        shortlist,
        totalApplicants: applicants.length,
        shortlistSize: shortlist.length,
        processedAt: historyEntry.processedAt,
        lastUsedWeights: weights,
        history: [historyEntry, ...(existingResult?.history || [])].slice(0, 10),
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

export const updateCandidateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { jobId, candidateId } = req.params;
    const { status } = z.object({ status: CandidateStatusSchema }).parse(req.body);
    const result = await ScreeningResult.findOne({ jobId });

    if (!result) {
      throw createError("No screening results found", 404);
    }

    const candidate = result.shortlist.find(
      (item: ScoredCandidate) => item.candidateId === candidateId,
    );

    if (!candidate) {
      throw createError("Candidate not found in shortlist", 404);
    }

    candidate.status = status;
    await result.save();

    res.json({
      success: true,
      message: "Candidate status updated",
      data: result,
    });
  } catch (error) {
    next(error);
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

export const getAnalytics = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [totalJobs, totalApplicants, jobs, screeningResults] = await Promise.all([
      Job.countDocuments(),
      Applicant.countDocuments(),
      Job.find().select("skills"),
      ScreeningResult.find().select("shortlist totalApplicants history"),
    ]);

    const totalScreened = screeningResults.reduce((sum, result) => {
      if (result.history.length > 0) {
        return (
          sum +
          result.history.reduce(
            (historySum: number, entry: ScreeningHistoryEntry) =>
              historySum + entry.totalApplicants,
            0,
          )
        );
      }

      return sum + result.totalApplicants;
    }, 0);

    const allRunScores = screeningResults.flatMap((result) =>
      result.history.length > 0
        ? result.history.map((entry: ScreeningHistoryEntry) => entry.avgMatchScore)
        : result.shortlist.length > 0
          ? [
              Math.round(
                result.shortlist.reduce(
                  (sum: number, candidate: ScoredCandidate) =>
                    sum + candidate.matchScore,
                  0,
                ) / result.shortlist.length,
              ),
            ]
          : [],
    );
    const avgMatchScore =
      allRunScores.length > 0
        ? Math.round(allRunScores.reduce((sum, value) => sum + value, 0) / allRunScores.length)
        : 0;

    const skillCounts = new Map<string, number>();
    jobs.forEach((job) => {
      job.skills.forEach((skill: string) => {
        const normalized = skill.trim();

        if (!normalized) {
          return;
        }

        skillCounts.set(normalized, (skillCounts.get(normalized) || 0) + 1);
      });
    });

    const topSkill =
      [...skillCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] || "—";

    const summary: AnalyticsSummary = {
      totalJobs,
      totalApplicants,
      totalScreened,
      avgMatchScore,
      topSkill,
    };

    res.json({ success: true, data: summary });
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
