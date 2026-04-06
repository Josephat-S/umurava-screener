export function buildExplanationPrompt(
  candidateName: string,
  jobTitle: string,
  candidateProfile: string,
  jobRequirements: string,
): string {
  return `
You are a senior HR consultant explaining a candidate assessment to a recruiter.

Candidate: ${candidateName}
Job: ${jobTitle}

Candidate Profile:
${candidateProfile}

Job Requirements:
${jobRequirements}

Write a detailed 3-4 paragraph assessment of this candidate for this role.
Cover: technical fit, experience alignment, potential red flags, and overall hiring advice.
Write in plain English. No bullet points. No jargon. Address the recruiter directly.
`.trim();
}
