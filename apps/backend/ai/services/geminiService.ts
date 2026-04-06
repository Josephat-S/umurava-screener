import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { buildScreeningPrompt } from "../prompts/screeningPrompt";
import { CandidateInput, JobInput, ScoredCandidate } from "../types/aiTypes";

const ScoredCandidateSchema = z.object({
  rank: z.number().int().positive(),
  candidateId: z.string().trim().min(1),
  candidateName: z.string().trim().min(1),
  matchScore: z.number().min(0).max(100),
  strengths: z.string().trim().min(1),
  gaps: z.string().trim().min(1),
  recommendation: z.string().trim().min(1),
});

const ScreeningOutputSchema = z.array(ScoredCandidateSchema);

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }

  return new GoogleGenerativeAI(apiKey);
}

export async function runGeminiScreening(
  job: JobInput,
  candidates: CandidateInput[],
  shortlistSize = 10,
): Promise<ScoredCandidate[]> {
  if (candidates.length === 0) {
    return [];
  }

  const model = getGeminiClient().getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = buildScreeningPrompt(job, candidates, shortlistSize);
  const result = await model.generateContent(prompt);
  const rawText = result.response.text();
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Gemini returned invalid JSON. Raw response: ${rawText.slice(0, 300)}`);
  }

  const validated = ScreeningOutputSchema.safeParse(parsed);

  if (!validated.success) {
    throw new Error(`Gemini output failed validation: ${validated.error.message}`);
  }

  return validated.data;
}
