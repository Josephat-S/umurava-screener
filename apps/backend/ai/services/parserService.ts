import pdfParse from "pdf-parse";
import * as XLSX from "xlsx";
import { CandidateInput } from "../types/aiTypes";

const sanitizeText = (value: unknown): string =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

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

export async function parsePDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text.replace(/\s+/g, " ").trim();
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
      const name = getCellValue(row, "name", "fullName", "full_name");
      const email = getCellValue(row, "email");
      const education = getCellValue(row, "education", "educationLevel", "education_level");
      const currentRole = getCellValue(row, "currentRole", "current_role", "role", "title");
      const summary = getCellValue(row, "summary", "profile", "bio");

      return {
        _id: `upload_${Date.now()}_${index}`,
        name,
        email,
        skills: splitSkills(getCellValue(row, "skills", "techStack", "tech_stack")),
        experienceYears: parseExperienceYears(row),
        education: education || "Not provided",
        currentRole: currentRole || undefined,
        summary: summary || undefined,
        source: "upload" as const,
      };
    })
    .filter((candidate) => Boolean(candidate.name || candidate.email || candidate.skills.length));
}

export async function parsePDFResumes(
  files: Express.Multer.File[],
): Promise<CandidateInput[]> {
  const parsed = await Promise.all(
    files.map(async (file, index) => {
      const resumeText = await parsePDF(file.buffer);
      const baseName = file.originalname.replace(/\.pdf$/i, "").trim();
      const candidateName = baseName || `Resume ${index + 1}`;

      return {
        _id: `pdf_${Date.now()}_${index}`,
        name: candidateName,
        email: `resume-${index + 1}@placeholder.local`,
        skills: [],
        experienceYears: 0,
        education: "Not provided",
        summary: resumeText.slice(0, 500) || undefined,
        resumeText,
        source: "upload" as const,
      };
    }),
  );

  return parsed;
}
