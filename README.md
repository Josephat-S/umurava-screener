# Umurava Screener

Umurava Screener is an AI-powered recruiter workspace built for the Umurava AI Hackathon. It helps recruiters define a job, ingest applicants from structured profiles or external sources, run Gemini-powered screening, review a ranked shortlist, and keep human decision-makers in control of the hiring process.

## Project Overview

The product is designed around the two hackathon scenarios:

- Screening applicants from the Umurava platform through structured talent profiles
- Screening applicants from external sources through spreadsheet uploads, PDF resumes, and public PDF resume links

Recruiters can:

- Create, edit, and delete job postings
- Parse pasted job descriptions with Gemini to prefill the job form
- Add structured candidates manually
- Upload PDF, CSV, XLS, and XLSX applicant files
- Import resume links that point directly to PDF resumes
- Trigger AI screening with adjustable scoring weights
- Review ranked Top 10 or Top 20 shortlists with strengths, gaps, and recommendations
- Compare finalists, export results, and move candidates through hiring stages

## Architecture

Detailed notes live in [docs/architecture.md](docs/architecture.md). High-level flow:

```text
Next.js recruiter dashboard
        |
        v
Express + TypeScript API
        |
        +--> MongoDB (jobs, applicants, screening results)
        |
        +--> Gemini API (job parsing + candidate screening)
```

## Stack

- Frontend: Next.js 16, React 19, Tailwind CSS 4, Redux Toolkit
- Backend: Node.js, Express, TypeScript
- Database: MongoDB with Mongoose
- AI Layer: Gemini API
- Parsing: `pdf-parse` for resumes, `xlsx` for spreadsheet ingestion

## Repository Structure

```text
apps/
  backend/   Express API, Mongo models, AI services
  frontend/  Next.js recruiter dashboard
docs/
  ai-decision-flow.md
  architecture.md
```

## Setup Instructions

### Prerequisites

- Node.js 20+
- npm
- A running MongoDB instance
- A Gemini API key

### Backend

1. Install dependencies:

   ```bash
   cd apps/backend
   npm install
   ```

2. Create `apps/backend/.env` using `apps/backend/.env.example`
3. Start the API:

   ```bash
   npm run dev
   ```

The backend runs on `http://localhost:8000` by default.

### Frontend

1. Install dependencies:

   ```bash
   cd apps/frontend
   npm install
   ```

2. Create `apps/frontend/.env.local` using `apps/frontend/.env.local.example`
3. Start the app:

   ```bash
   npm run dev
   ```

The frontend runs on `http://localhost:3000` by default.

## Environment Variables

### Backend

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `GEMINI_API_KEY` | Yes | Gemini API key used for parsing and screening |
| `GEMINI_MODELS` | No | Comma-separated model fallback list, for example `gemini-2.5-flash,gemini-2.5-flash-lite` |
| `GEMINI_MODEL` | No | Single-model override |
| `PORT` | No | Backend port, defaults to `8000` |
| `NODE_ENV` | No | Runtime environment label |

### Frontend

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL for the backend API |

## AI Decision Flow

The AI workflow is documented in [docs/ai-decision-flow.md](docs/ai-decision-flow.md). In summary:

1. Gemini can parse a pasted job description into structured job fields.
2. Applicants are ingested from structured inputs, spreadsheets, uploaded PDFs, or PDF resume links.
3. A deterministic pre-filter narrows candidates before LLM screening.
4. Gemini scores and explains shortlisted candidates using weighted criteria.
5. Results are stored with screening history and recruiter-controlled status updates.

## Assumptions And Limitations

- Resume links should point directly to publicly reachable PDF files.
- PDF resume parsing currently extracts text and uses filename or URL basename as the candidate label when richer metadata is unavailable.
- Uploaded resumes may use placeholder emails when the source document does not contain a reliable address.
- The product is intentionally human-in-the-loop: AI recommends and explains, but recruiters own final hiring decisions.
- Deployment is not bundled in this repository; hosting configuration should be added during submission.
