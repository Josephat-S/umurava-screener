import mongoose, { Document, Schema } from "mongoose";

export interface ISkill {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  yearsOfExperience: number;
}

export interface ILanguage {
  name: string;
  proficiency: "Basic" | "Conversational" | "Fluent" | "Native";
}

export interface IWorkExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  isCurrent: boolean;
}

export interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
}

export interface ICertification {
  name: string;
  issuer: string;
  issueDate: string;
}

export interface IProject {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link: string;
  startDate: string;
  endDate: string;
}

export interface IAvailability {
  status: "Available" | "Open to Opportunities" | "Not Available";
  type: "Full-time" | "Part-time" | "Contract";
  startDate?: string;
}

export interface ISocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface IApplicant extends Document {
  jobId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio?: string;
  location: string;
  skills: ISkill[];
  languages?: ILanguage[];
  experience: IWorkExperience[];
  education: IEducation[];
  certifications?: ICertification[];
  projects: IProject[];
  availability: IAvailability;
  socialLinks?: ISocialLinks;
  source: "platform" | "upload";
  isIncomplete: boolean;
  incompletenessReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>({
  name: { type: String, required: true },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
    required: true,
  },
  yearsOfExperience: { type: Number, required: true },
});

const LanguageSchema = new Schema<ILanguage>({
  name: { type: String, required: true },
  proficiency: {
    type: String,
    enum: ["Basic", "Conversational", "Fluent", "Native"],
    required: true,
  },
});

const WorkExperienceSchema = new Schema<IWorkExperience>({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  description: { type: String, required: true },
  technologies: { type: [String], default: [] },
  isCurrent: { type: Boolean, default: false },
});

const EducationSchema = new Schema<IEducation>({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String, required: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number, required: true },
});

const CertificationSchema = new Schema<ICertification>({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: String, required: true },
});

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  technologies: { type: [String], default: [] },
  role: { type: String, required: true },
  link: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
});

const AvailabilitySchema = new Schema<IAvailability>({
  status: {
    type: String,
    enum: ["Available", "Open to Opportunities", "Not Available"],
    required: true,
  },
  type: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract"],
    required: true,
  },
  startDate: { type: String },
});

const SocialLinksSchema = new Schema<ISocialLinks>({
  linkedin: { type: String },
  github: { type: String },
  portfolio: { type: String },
});

const ApplicantSchema = new Schema<IApplicant>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, index: true },
    headline: { type: String, required: true, trim: true },
    bio: { type: String, trim: true },
    location: { type: String, required: true, trim: true },
    skills: { type: [SkillSchema], required: true },
    languages: { type: [LanguageSchema], default: [] },
    experience: { type: [WorkExperienceSchema], required: true },
    education: { type: [EducationSchema], required: true },
    certifications: { type: [CertificationSchema], default: [] },
    projects: { type: [ProjectSchema], required: true },
    availability: { type: AvailabilitySchema, required: true },
    socialLinks: { type: SocialLinksSchema },
    source: {
      type: String,
      enum: ["platform", "upload"],
      default: "platform",
      required: true,
    },
    isIncomplete: { type: Boolean, default: false },
    incompletenessReason: { type: String },
  },
  { timestamps: true },
);

export const Applicant =
  mongoose.models.Applicant ||
  mongoose.model<IApplicant>("Applicant", ApplicantSchema);
