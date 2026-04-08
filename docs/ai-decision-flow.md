# AI Decision Flow

This document explains how Umurava Screener uses Gemini and supporting logic to screen candidates in a transparent, recruiter-friendly way.

## Goals

- Match applicants to a job in a way that is explainable
- Preserve human control over final hiring decisions
- Support both structured talent profiles and external resume inputs

## End-To-End Flow

### 1. Job Definition

Recruiters can either:

- Fill the job form manually
- Paste a full job description and let Gemini extract:
  - title
  - description
  - skills
  - requirements
  - experience years
  - education level
  - location

Relevant code:

- `apps/backend/controllers/jobController.ts`
- `apps/backend/ai/services/parserService.ts`

### 2. Applicant Ingestion

Applicants can enter the system through four paths:

- Structured platform profiles entered in the recruiter dashboard
- Spreadsheet uploads (`.csv`, `.xls`, `.xlsx`)
- Direct PDF uploads
- Public PDF resume links

Spreadsheet rows are normalized into a shared applicant shape. PDF resumes are converted to raw text and stored as unstructured profile context for screening.

Relevant code:

- `apps/backend/controllers/applicantController.ts`
- `apps/backend/ai/services/parserService.ts`

### 3. Deterministic Pre-Filtering

Before calling Gemini, the backend runs a rule-based filter to remove candidates who are clearly below the job threshold. This reduces noise, improves consistency, and keeps prompts focused.

The filter considers the configured scoring weights for:

- skills
- experience
- education
- profile quality

Relevant code:

- `apps/backend/ai/services/scoringService.ts`

### 4. Gemini Screening

Qualified candidates are sent to Gemini in a single prompt alongside the job details and scoring rubric. The prompt asks Gemini to:

- evaluate all candidates together
- return only the requested shortlist size
- provide a rank
- produce a `matchScore` from 0 to 100
- explain strengths
- explain gaps
- provide a final recommendation

Prompt design choices:

- strict JSON-only output
- explicit field names
- explicit weight values
- recruiter-oriented natural language
- all shortlisted candidates returned in one response

Relevant code:

- `apps/backend/ai/prompts/screeningPrompt.ts`
- `apps/backend/ai/services/geminiService.ts`

### 5. Final Shortlist Shaping

After Gemini responds:

- the shortlist is normalized and validated with Zod
- previous recruiter stage statuses are preserved
- confidence labels are attached based on data quality
- results are saved in MongoDB with screening history

Confidence is higher for richer structured profiles and lower when the model had to rely mostly on raw resume text.

Relevant code:

- `apps/backend/controllers/screeningController.ts`
- `apps/backend/models/ScreeningResult.ts`

### 6. Recruiter Review

The frontend presents the shortlist through:

- ranked candidate cards
- strengths, gaps, and recommendation sections
- comparison view
- export tools
- kanban-style hiring workflow
- screening history and score summaries

This keeps the system aligned with the hackathon requirement that humans stay in control of final decisions.

Relevant code:

- `apps/frontend/app/dashboard/ai-screening/page.tsx`
- `apps/frontend/app/dashboard/_components/ScreenedCandidateCard.tsx`
- `apps/frontend/app/dashboard/_components/ComparisonView.tsx`
- `apps/frontend/app/dashboard/_components/KanbanBoard.tsx`

## AI Assumptions

- The job definition is a reliable source of screening intent.
- Resume text quality varies; recruiter review is still necessary.
- Match scores are recommendations, not deterministic hiring truth.

## Known Limitations

- Resume PDFs are parsed as text; complex layouts can reduce extraction quality.
- Resume links must be publicly reachable when the backend fetches them.
- Uploaded resumes without explicit metadata may produce fallback names or placeholder emails.
- The shortlist quality depends on the clarity of the job description and candidate inputs.
