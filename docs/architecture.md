# Architecture

## High-Level View

```text
                         +----------------------+
                         |  Next.js Frontend    |
                         |  Recruiter Dashboard |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         | Express API Backend  |
                         | TypeScript + Zod     |
                         +----+-----------+-----+
                              |           |
                              |           |
                              v           v
                     +----------------+  +----------------------+
                     |   MongoDB      |  | Gemini API          |
                     | Jobs           |  | Job parsing         |
                     | Applicants     |  | Candidate screening |
                     | Screening      |  | Shortlist reasoning |
                     +----------------+  +----------------------+
```

## Frontend Responsibilities

The frontend lives in `apps/frontend` and provides the recruiter-facing workflow:

- dashboard metrics and recent activity
- job creation and editing
- structured applicant entry
- external applicant ingestion
- AI screening controls and shortlist review
- candidate comparison, export, and workflow updates

Key technologies:

- Next.js App Router
- React 19
- Redux Toolkit for state management
- Tailwind CSS for styling

## Backend Responsibilities

The backend lives in `apps/backend` and exposes REST endpoints for:

- jobs
- applicants
- screening
- analytics and health checks

Key responsibilities:

- validate incoming data with Zod
- orchestrate Gemini requests
- normalize spreadsheet and resume inputs
- persist results in MongoDB
- return recruiter-friendly API responses

## Data Model Summary

### Job

Stores the role definition used for screening:

- title
- description
- requirements
- skills
- experience years
- education level
- location
- shortlist size

### Applicant

Stores the candidate record attached to a job:

- core identity fields
- structured skills and experience
- optional summary
- optional parsed resume text
- source type (`platform` or `upload`)

### Screening Result

Stores the latest shortlist for a job plus history:

- shortlisted candidates
- total applicants
- shortlist size
- processed timestamp
- last-used scoring weights
- screening history entries

## Request Flow

### Job Parsing

1. Recruiter pastes a job description in the frontend
2. Frontend calls `POST /api/jobs/parse`
3. Backend sends a structured extraction prompt to Gemini
4. Parsed fields are returned and used to prefill the job form

### Applicant Ingestion

1. Recruiter adds structured profiles or imports external sources
2. Backend normalizes spreadsheets and PDF resume content
3. Applicants are stored in MongoDB under the selected job

### AI Screening

1. Frontend sends `POST /api/screening/:jobId/trigger` with weights
2. Backend loads the job and applicants
3. Rule-based filtering narrows the pool
4. Gemini evaluates qualified candidates in a single shortlist prompt
5. Results are validated, enriched, persisted, and returned to the UI

## Deployment Shape

Recommended deployment split for submission:

- Frontend on Vercel
- Backend on Railway, Render, or Fly.io
- MongoDB Atlas for the database

This matches the hackathon guidance while keeping the apps independently deployable.
