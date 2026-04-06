import api from "@/services/api";
import type { ApiResponse, Applicant, StructuredApplicantInput } from "@/types";

export const applicantService = {
  async getByJob(jobId: string): Promise<Applicant[]> {
    const response = await api.get<ApiResponse<Applicant[]>>(
      `/api/applicants/job/${jobId}`,
    );
    return response.data.data || [];
  },

  async addStructured(
    jobId: string,
    applicants: StructuredApplicantInput[],
  ): Promise<Applicant[]> {
    const response = await api.post<ApiResponse<Applicant[]>>("/api/applicants", {
      jobId,
      applicants,
    });
    return response.data.data || [];
  },

  async uploadFiles(jobId: string, files: File[]): Promise<Applicant[]> {
    const formData = new FormData();
    formData.append("jobId", jobId);
    files.forEach((file) => formData.append("files", file));

    const response = await api.post<ApiResponse<Applicant[]>>(
      "/api/applicants/upload",
      formData,
    );
    return response.data.data || [];
  },
};
