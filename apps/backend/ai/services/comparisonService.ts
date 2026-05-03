import { buildComparisonPrompt } from "../prompts/comparisonPrompt";
import { generateGeminiText } from "./geminiClient";
import { CandidateInput, JobInput } from "../types/aiTypes";

export async function runCandidateComparison(
  job: JobInput,
  candidates: CandidateInput[],
): Promise<string> {
  if (candidates.length < 2) {
    return "Please select at least two candidates to compare.";
  }

  const prompt = buildComparisonPrompt(job, candidates);
  const { text } = await generateGeminiText(prompt);

  return text.trim();
}
