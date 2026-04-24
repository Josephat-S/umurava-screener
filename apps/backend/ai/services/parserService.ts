import pdfParse from "pdf-parse";
import * as XLSX from "xlsx";
import { z } from "zod";
import { generateGeminiText } from "./geminiClient";
import { CandidateInput, ParsedJobDescription } from "../types/aiTypes";

const sanitizeText = (value: unknown): string =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const ParsedJobDescriptionSchema = z.object({
  title: z.string().catch(""),
  description: z.string().catch(""),
  skills: z.array(z.string()).catch([]),
  requirements: z.array(z.string()).catch([]),
  experienceYears: z.coerce.number().min(0).catch(0),
  educationLevel: z.string().catch(""),
  location: z.string().optional().catch(""),
});

const splitSkills = (value: unknown): string[] =>
  sanitizeText(value)
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const getCellValue = (row: Record<string, unknown>, ...keys: string[]): string => {
  const entries = Object.entries(row);

  for (const key of keys) {
    const match = entries.find(
      ([entryKey]) => entryKey.trim().toLowerCase() === key.trim().toLowerCase(),
    );

    if (match) {
      return sanitizeText(match[1]);
    }
  }

  return "";
};

const parseExperienceYears = (row: Record<string, unknown>): number => {
  const value = getCellValue(
    row,
    "experience",
    "experienceYears",
    "experience_years",
    "yearsOfExperience",
  );
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const normalizeResumeLabel = (value: string, fallback: string): string => {
  const cleaned = value
    .replace(/\.pdf$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();

  return cleaned || fallback;
};

const decodeResumeLabel = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const buildResumeCandidate = (
  label: string,
  resumeText: string,
  index: number,
): CandidateInput => {
  const [firstName = "Candidate", ...lastNameParts] = label.split(" ");
  const lastName = lastNameParts.join(" ") || String(index + 1);

  return {
    _id: `resume_${Date.now()}_${index}`,
    firstName,
    lastName,
    email: `resume-${index + 1}@placeholder.local`,
    headline: "Extracted from Resume",
    location: "Unknown",
    skills: [],
    experience: [],
    education: [],
    projects: [],
    availability: { status: "Open to Opportunities", type: "Full-time" },
    resumeText,
    source: "upload" as const,
  };
};

export async function parsePDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text.replace(/\s+/g, " ").trim();
}

export async function parseJobDescriptionWithAI(
  description: string,
): Promise<ParsedJobDescription> {
  const prompt = `
Extract structured hiring information from the job description below.
Return ONLY valid JSON with these exact fields:
{
  "title": "job title",
  "description": "brief 2-3 sentence summary",
  "skills": ["skill1", "skill2"],
  "requirements": ["requirement1", "requirement2"],
  "experienceYears": 3,
  "educationLevel": "Bachelor",
  "location": "city, country or Remote"
}

Job Description:
${description}

Return ONLY JSON. No markdown. No explanation.
  `.trim();

  const { text: rawText } = await generateGeminiText(prompt);
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Gemini returned invalid JSON. Raw response: ${rawText.slice(0, 300)}`);
  }

  const validated = ParsedJobDescriptionSchema.parse(parsed);

  return {
    title: sanitizeText(validated.title),
    description: sanitizeText(validated.description),
    skills: validated.skills.map((item) => sanitizeText(item)).filter(Boolean),
    requirements: validated.requirements
      .map((item) => sanitizeText(item))
      .filter(Boolean),
    experienceYears: validated.experienceYears,
    educationLevel: sanitizeText(validated.educationLevel),
    location: sanitizeText(validated.location),
  };
}

export function parseSpreadsheet(buffer: Buffer): CandidateInput[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheet = workbook.SheetNames[0];

  if (!firstSheet) {
    return [];
  }

  const sheet = workbook.Sheets[firstSheet];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  return rows
    .map((row, index) => {
      const fullName = getCellValue(row, "name", "fullName", "full_name");
      const [firstName = "Candidate", ...lastNameParts] = fullName.split(" ");
      const lastName = lastNameParts.join(" ") || String(index + 1);
      const email = getCellValue(row, "email");
      const headline = getCellValue(row, "headline", "currentRole", "role", "title") || "Professional";
      const location = getCellValue(row, "location", "city", "country") || "Remote";

      return {
        _id: `upload_${Date.now()}_${index}`,
        firstName,
        lastName,
        email,
        headline,
        location,
        skills: [], // Spreadsheet parser needs update to handle structured skills
        experience: [],
        education: [],
        projects: [],
        availability: {
          status: "Open to Opportunities" as const,
          type: "Full-time" as const,
        },
        source: "upload" as const,
      };
    })
    .filter((candidate) => Boolean(candidate.firstName || candidate.email));
}

export async function parsePDFResumes(
  files: Express.Multer.File[],
): Promise<CandidateInput[]> {
  const parsed = await Promise.all(
    files.map(async (file, index) => {
      const resumeText = await parsePDF(file.buffer);
      const candidateName = normalizeResumeLabel(
        file.originalname,
        `Resume ${index + 1}`,
      );

      return buildResumeCandidate(candidateName, resumeText, index);
    }),
  );

  return parsed;
}

export async function parseResumeLinks(
  resumeLinks: string[],
): Promise<CandidateInput[]> {
  return Promise.all(
    resumeLinks.map(async (resumeLink, index) => {
      const response = await fetch(resumeLink);

      if (!response.ok) {
        throw new Error(`Unable to download resume link: ${resumeLink}`);
      }

      const contentType = response.headers.get("content-type")?.toLowerCase() || "";
      const url = new URL(resumeLink);

      if (!contentType.includes("pdf") && !url.pathname.toLowerCase().endsWith(".pdf")) {
        throw new Error(`Resume links must point to PDF files: ${resumeLink}`);
      }

      const resumeBuffer = Buffer.from(await response.arrayBuffer());
      const resumeText = await parsePDF(resumeBuffer);
      const rawLabel =
        url.pathname.split("/").filter(Boolean).pop() || `Resume Link ${index + 1}`;
      const decodedLabel = decodeResumeLabel(rawLabel);
      const candidateName = normalizeResumeLabel(
        decodedLabel,
        `Resume Link ${index + 1}`,
      );

      return buildResumeCandidate(candidateName, resumeText, index);
    }),
  );
}
