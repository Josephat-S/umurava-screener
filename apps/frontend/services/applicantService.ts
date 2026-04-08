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

  async uploadFiles(
    jobId: string,
    files: File[],
    resumeLinks: string[] = [],
  ): Promise<Applicant[]> {
    const formData = new FormData();
    formData.append("jobId", jobId);
    files.forEach((file) => formData.append("files", file));
    resumeLinks.forEach((link) => formData.append("resumeLinks", link));

    const response = await api.post<ApiResponse<Applicant[]>>(
      "/api/applicants/upload",
      formData,
    );
    return response.data.data || [];
  },

  async deleteById(jobId: string, applicantId: string): Promise<void> {
    await api.delete(`/api/applicants/job/${jobId}/${applicantId}`);
  },

  async clearByJob(jobId: string): Promise<number> {
    const response = await api.delete<ApiResponse<{ deletedCount: number }>>(
      `/api/applicants/job/${jobId}`,
    );

    return response.data.data?.deletedCount ?? response.data.count ?? 0;
  },
};
