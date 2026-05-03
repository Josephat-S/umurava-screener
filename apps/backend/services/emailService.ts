import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  const { to, subject, body } = options;

  if (!resend) {
    console.log("------------------------------------------");
    console.log("⚠️  RESEND_API_KEY NOT FOUND - LOGGING TO CONSOLE");
    console.log(`📧 SENDING EMAIL TO: ${to}`);
    console.log(`📝 SUBJECT: ${subject}`);
    console.log(`📄 BODY:\n${body}`);
    console.log("------------------------------------------");
    return true;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      text: body,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return false;
    }

    console.log(`✅ Email sent successfully to ${to}. ID: ${data?.id}`);
    return true;
  } catch (err) {
    console.error("❌ Failed to send email via Resend:", err);
    return false;
  }
};

export const getInterviewInviteTemplate = (
  candidateName: string,
  jobTitle: string,
): EmailOptions => ({
  to: "", // To be filled by controller
  subject: `Interview Invitation: ${jobTitle} at Umurava`,
  body: `
Hi ${candidateName},

Great news! Our AI-powered screening has highlighted you as a top candidate for the ${jobTitle} role.

We would love to schedule a technical interview to learn more about your experience and how you can contribute to our team.

Please let us know your availability for a 45-minute call sometime next week.

Best regards,
The Umurava Hiring Team
  `.trim(),
});

export const getRejectionTemplate = (
  candidateName: string,
  jobTitle: string,
  gaps?: string,
): EmailOptions => ({
  to: "", // To be filled by controller
  subject: `Update regarding your application for ${jobTitle}`,
  body: `
Hi ${candidateName},

Thank you for your interest in the ${jobTitle} position at Umurava and for taking the time to apply.

After carefully reviewing your application against our current requirements, we have decided to move forward with other candidates at this time.

${gaps ? `Our AI screening noted some areas where your current profile didn't fully align with our needs: ${gaps}` : ""}

We will keep your profile in our talent pool for future opportunities that match your skills.

We wish you the very best in your job search.

Best regards,
The Umurava Hiring Team
  `.trim(),
});
