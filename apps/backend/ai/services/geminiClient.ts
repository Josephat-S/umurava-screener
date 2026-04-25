import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];
const MAX_ATTEMPTS_PER_MODEL = 2;
const GEMINI_MODEL_ALIASES: Record<string, string> = {
  "gemini-1.5-flash": "gemini-2.5-flash-lite",
  "gemini-1.5-pro": "gemini-2.5-pro",
};

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }

  return new GoogleGenerativeAI(apiKey);
}

function getGeminiModels(): string[] {
  const configuredModels = (
    process.env.GEMINI_MODELS || process.env.GEMINI_MODEL || ""
  )
    .split(",")
    .map((value) => value.trim())
    .map((value) => GEMINI_MODEL_ALIASES[value] || value)
    .filter(Boolean);

  return configuredModels.length > 0
    ? Array.from(new Set(configuredModels))
    : DEFAULT_GEMINI_MODELS;
}

function isRetryableGeminiError(error: unknown): boolean {
  const message = (error as Error)?.message?.toLowerCase() || "";

  return [
    "fetch failed",
    "timed out",
    "timeout",
    "econnreset",
    "enotfound",
    "503",
    "502",
    "500",
    "429",
    "network",
    "unavailable",
  ].some((token) => message.includes(token));
}

function isUnsupportedModelError(error: unknown): boolean {
  const message = (error as Error)?.message?.toLowerCase() || "";

  return [
    "404",
    "not found",
    "not supported for generatecontent",
    "model",
  ].every((token) => message.includes(token));
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function generateGeminiText(
  prompt: string,
  inlineData?: { data: string; mimeType: string },
): Promise<{ text: string; model: string }> {
  const client = getGeminiClient();
  const models = getGeminiModels();
  let lastError: unknown = null;
  const failedModels: string[] = [];

  for (const modelName of models) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt += 1) {
      try {
        const model = client.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(
          inlineData ? [prompt, { inlineData }] : prompt,
        );

        return {
          text: result.response.text(),
          model: modelName,
        };
      } catch (error) {
        lastError = error;
        const errorMessage =
          (error as Error)?.message || "Unknown Gemini request failure";

        const shouldRetry =
          attempt < MAX_ATTEMPTS_PER_MODEL && isRetryableGeminiError(error);

        if (!shouldRetry) {
          failedModels.push(
            `${modelName}: ${
              isUnsupportedModelError(error)
                ? "unsupported or unavailable model"
                : errorMessage
            }`,
          );
          break;
        }

        await wait(attempt * 750);
      }
    }
  }

  const lastMessage =
    (lastError as Error)?.message || "Unknown Gemini connectivity failure";
  const failureSummary =
    failedModels.length > 0 ? ` Failed models: ${failedModels.join(" | ")}.` : "";

  throw new Error(
    `Gemini request failed after trying ${models.join(
      ", ",
    )}. Check internet access, API key validity, Gemini API availability, or set GEMINI_MODELS to working model names.${failureSummary} Last error: ${lastMessage}`,
  );
}
