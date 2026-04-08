"use client";

import { Download, FileText } from "lucide-react";
import toast from "react-hot-toast";
import type { ScoredCandidate } from "@/types";

interface ExportButtonProps {
  shortlist: ScoredCandidate[];
  jobTitle: string;
}

interface PdfLine {
  text: string;
  size: number;
  indent: number;
}

const PDF_PAGE_WIDTH = 612;
const PDF_PAGE_HEIGHT = 792;
const PDF_MARGIN_X = 48;
const PDF_MARGIN_TOP = 744;
const PDF_MARGIN_BOTTOM = 48;
const PDF_LINE_GAP = 4;
const pdfEncoder = new TextEncoder();

function escapePdfText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\s+/g, " ")
    .trim();
}

function wrapPdfText(value: string, maxChars: number): string[] {
  const normalized = value.trim();

  if (!normalized) {
    return [""];
  }

  const words = normalized.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    if (word.length > maxChars) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = "";
      }

      for (let index = 0; index < word.length; index += maxChars) {
        lines.push(word.slice(index, index + maxChars));
      }
      return;
    }

    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length <= maxChars) {
      currentLine = nextLine;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function getPdfByteLength(value: string): number {
  return pdfEncoder.encode(value).length;
}

function buildPdfBlob(shortlist: ScoredCandidate[], jobTitle: string): Blob {
  const createdAt = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());

  const lines: PdfLine[] = [
    { text: `${jobTitle} Shortlist`, size: 20, indent: 0 },
    {
      text: `Generated from Umurava AI Screening on ${createdAt}`,
      size: 11,
      indent: 0,
    },
    { text: "", size: 10, indent: 0 },
  ];

  shortlist.forEach((candidate) => {
    lines.push({
      text: `#${candidate.rank} ${candidate.candidateName}`,
      size: 15,
      indent: 0,
    });
    lines.push({
      text: `Match Score: ${candidate.matchScore}%   Status: ${candidate.status || "shortlisted"}   Confidence: ${candidate.confidenceLevel || "medium"}`,
      size: 11,
      indent: 0,
    });
    lines.push({
      text: `Recommendation: ${candidate.recommendation}`,
      size: 11,
      indent: 0,
    });
    lines.push({
      text: `Strengths: ${candidate.strengths}`,
      size: 10,
      indent: 12,
    });
    lines.push({
      text: `Gaps: ${candidate.gaps}`,
      size: 10,
      indent: 12,
    });
    lines.push({ text: "", size: 10, indent: 0 });
  });

  const printableWidth = PDF_PAGE_WIDTH - PDF_MARGIN_X * 2;
  const pageStreams: string[] = [];
  let commands: string[] = [];
  let yPosition = PDF_MARGIN_TOP;

  const startNewPage = () => {
    if (commands.length > 0) {
      pageStreams.push(commands.join("\n"));
    }
    commands = [];
    yPosition = PDF_MARGIN_TOP;
  };

  lines.forEach((line) => {
    const maxChars = Math.max(
      24,
      Math.floor((printableWidth - line.indent) / (line.size * 0.52)),
    );
    const wrappedLines = line.text ? wrapPdfText(line.text, maxChars) : [""];

    wrappedLines.forEach((segment) => {
      const lineHeight = line.size + PDF_LINE_GAP;

      if (yPosition - lineHeight < PDF_MARGIN_BOTTOM) {
        startNewPage();
      }

      if (segment) {
        commands.push(
          `BT /F1 ${line.size} Tf 1 0 0 1 ${PDF_MARGIN_X + line.indent} ${yPosition} Tm (${escapePdfText(segment)}) Tj ET`,
        );
      }

      yPosition -= lineHeight;
    });
  });

  if (commands.length > 0 || pageStreams.length === 0) {
    pageStreams.push(commands.join("\n"));
  }

  const objects: string[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  const pageObjectNumbers: number[] = [];
  const contentObjectNumbers: number[] = [];
  let objectNumber = 4;

  pageStreams.forEach((streamContent) => {
    const pageNumber = objectNumber;
    const contentNumber = objectNumber + 1;
    objectNumber += 2;

    pageObjectNumbers.push(pageNumber);
    contentObjectNumbers.push(contentNumber);

    const stream = `${streamContent}\n`;
    objects[contentNumber] =
      `<< /Length ${getPdfByteLength(stream)} >>\nstream\n${stream}endstream`;
    objects[pageNumber] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentNumber} 0 R >>`;
  });

  objects[2] =
    `<< /Type /Pages /Count ${pageObjectNumbers.length} /Kids [${pageObjectNumbers.map((value) => `${value} 0 R`).join(" ")}] >>`;

  let pdfContent = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (let index = 1; index < objects.length; index += 1) {
    const object = objects[index];

    if (!object) {
      continue;
    }

    offsets[index] = getPdfByteLength(pdfContent);
    pdfContent += `${index} 0 obj\n${object}\nendobj\n`;
  }

  const xrefOffset = getPdfByteLength(pdfContent);
  pdfContent += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;

  for (let index = 1; index < objects.length; index += 1) {
    const offset = offsets[index] || 0;
    pdfContent += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }

  pdfContent += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdfContent], { type: "application/pdf" });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export default function ExportButton({
  shortlist,
  jobTitle,
}: ExportButtonProps) {
  if (shortlist.length === 0) {
    return null;
  }

  const exportCSV = () => {
    const headers = [
      "Rank",
      "Name",
      "Score",
      "Status",
      "Strengths",
      "Gaps",
      "Recommendation",
    ];
    const rows = shortlist.map((candidate) => [
      candidate.rank,
      candidate.candidateName,
      candidate.matchScore,
      candidate.status || "shortlisted",
      `"${candidate.strengths.replaceAll('"', "'")}"`,
      `"${candidate.gaps.replaceAll('"', "'")}"`,
      `"${candidate.recommendation.replaceAll('"', "'")}"`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    downloadBlob(
      blob,
      `shortlist-${jobTitle.replace(/\s+/g, "-").toLowerCase()}.csv`,
    );
  };

  const exportPDF = () => {
    try {
      const pdfBlob = buildPdfBlob(shortlist, jobTitle);
      downloadBlob(
        pdfBlob,
        `shortlist-${jobTitle.replace(/\s+/g, "-").toLowerCase()}.pdf`,
      );
      toast.success("Shortlist PDF downloaded.");
    } catch {
      toast.error("Failed to generate shortlist PDF.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={exportCSV}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-[#3b82f6]"
      >
        <Download className="h-4 w-4" />
        Export CSV
      </button>
      <button
        type="button"
        onClick={exportPDF}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-[#3b82f6]"
      >
        <FileText className="h-4 w-4" />
        Export PDF
      </button>
    </div>
  );
}