# API Endpoints

Base URL for local development: `http://localhost:8000`

Auth note: authentication is not implemented in the current backend yet. The "Auth Required" column below is my recommendation for production.

## System Endpoints

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| GET | `/` | Basic welcome/status endpoint for the API. | No |
| GET | `/health` | Health check endpoint to confirm the server is running. | No |

### Usage Examples

```bash
curl http://localhost:8000/
curl http://localhost:8000/health
```

## Job Endpoints

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| POST | `/api/jobs` | Create a new job opening to be used for applicant screening. | Yes - recruiter/admin only |
| GET | `/api/jobs` | List all jobs, newest first. | Yes - recruiter/admin only |
| GET | `/api/jobs/:id` | Fetch one job by ID. | Yes - recruiter/admin only |
| PUT | `/api/jobs/:id` | Update a job. Supports partial updates. | Yes - recruiter/admin only |
| DELETE | `/api/jobs/:id` | Delete a job and also remove related applicants and screening results. | Yes - recruiter/admin only |

### `POST /api/jobs` Body Example

```json
{
  "title": "Backend Engineer",
  "description": "Build and maintain scalable backend services for our platform.",
  "requirements": [
    "Strong TypeScript experience",
    "Experience building REST APIs",
    "Comfortable working with MongoDB"
  ],
  "skills": ["Node.js", "TypeScript", "Express", "MongoDB"],
  "experienceYears": 3,
  "educationLevel": "Bachelor",
  "location": "Kigali, Rwanda",
  "shortlistSize": 10
}
```

### `PUT /api/jobs/:id` Body Example

```json
{
  "description": "Build and maintain scalable backend services and internal AI tooling.",
  "skills": ["Node.js", "TypeScript", "Express", "MongoDB", "AI Integration"],
  "shortlistSize": 20
}
```

### Job Usage Examples

```bash
curl -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Backend Engineer",
    "description": "Build and maintain scalable backend services for our platform.",
    "requirements": ["Strong TypeScript experience", "Experience building REST APIs"],
    "skills": ["Node.js", "TypeScript", "Express", "MongoDB"],
    "experienceYears": 3,
    "educationLevel": "Bachelor",
    "location": "Kigali, Rwanda",
    "shortlistSize": 10
  }'

curl http://localhost:8000/api/jobs
curl http://localhost:8000/api/jobs/<jobId>

curl -X PUT http://localhost:8000/api/jobs/<jobId> \
  -H "Content-Type: application/json" \
  -d '{
    "shortlistSize": 20
  }'

curl -X DELETE http://localhost:8000/api/jobs/<jobId>
```

## Applicant Endpoints

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| POST | `/api/applicants` | Add structured applicant profiles for a job. | Yes - recruiter/admin only |
| POST | `/api/applicants/upload` | Upload applicant files for a job using PDF, CSV, XLS, or XLSX. | Yes - recruiter/admin only |
| GET | `/api/applicants/job/:jobId` | Get all applicants attached to a specific job. | Yes - recruiter/admin only |

### `POST /api/applicants` Body Example

```json
{
  "jobId": "66112233445566778899aabb",
  "applicants": [
    {
      "name": "Alice Uwase",
      "email": "alice@example.com",
      "skills": ["Node.js", "TypeScript", "MongoDB"],
      "experienceYears": 4,
      "education": "Bachelor of Computer Science",
      "currentRole": "Backend Developer",
      "summary": "Built APIs and internal tooling for a fintech product."
    },
    {
      "name": "Jean Claude",
      "email": "jean@example.com",
      "skills": ["Express", "PostgreSQL", "REST APIs"],
      "experienceYears": 2,
      "education": "Bachelor in Software Engineering",
      "currentRole": "Junior Backend Engineer",
      "summary": "Focused on backend feature delivery and testing."
    }
  ]
}
```

### `POST /api/applicants/upload` Form-Data Example

This endpoint expects `multipart/form-data` with:

- `jobId`: the target job ID
- `files`: one or more files

Accepted file types:

- PDF resumes
- CSV spreadsheets
- Excel `.xls` / `.xlsx` spreadsheets

Recommended spreadsheet columns:

- `name`
- `email`
- `skills`
- `experience` or `experienceYears`
- `education`
- `currentRole`
- `summary`

```bash
curl -X POST http://localhost:8000/api/applicants/upload \
  -F "jobId=66112233445566778899aabb" \
  -F "files=@/path/to/candidates.xlsx" \
  -F "files=@/path/to/resume-1.pdf"
```

### Applicant Usage Examples

```bash
curl -X POST http://localhost:8000/api/applicants \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "66112233445566778899aabb",
    "applicants": [
      {
        "name": "Alice Uwase",
        "email": "alice@example.com",
        "skills": ["Node.js", "TypeScript", "MongoDB"],
        "experienceYears": 4,
        "education": "Bachelor of Computer Science",
        "currentRole": "Backend Developer",
        "summary": "Built APIs and internal tooling for a fintech product."
      }
    ]
  }'

curl http://localhost:8000/api/applicants/job/<jobId>
```

## Screening Endpoints

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| POST | `/api/screening/:jobId` | Trigger AI screening for all applicants linked to a job and save the shortlist. | Yes - recruiter/admin only |
| GET | `/api/screening/:jobId` | Fetch the saved screening results for a job. | Yes - recruiter/admin only |
| DELETE | `/api/screening/:jobId` | Clear the saved screening results for a job. | Yes - recruiter/admin only |

### `POST /api/screening/:jobId` Body Example

No request body is required. The endpoint uses the job and applicants already stored in the database.

```bash
curl -X POST http://localhost:8000/api/screening/<jobId>
```

### Screening Usage Examples

```bash
curl -X POST http://localhost:8000/api/screening/<jobId>
curl http://localhost:8000/api/screening/<jobId>
curl -X DELETE http://localhost:8000/api/screening/<jobId>
```

## Auth Advice

If this app is only for internal recruiter use, I strongly recommend:

- Public access only for `/` and `/health`
- Recruiter or admin auth for all `/api/jobs`, `/api/applicants`, and `/api/screening` routes
- Role-based permissions later if you add multiple recruiter teams or hiring managers
- Never expose applicant and screening routes publicly because they contain personal data and AI evaluation results
