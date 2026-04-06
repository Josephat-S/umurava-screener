import api from "@/services/api";
import type { ApiResponse, Job, JobFormData } from "@/types";

export const jobService = {
  async getAll(): Promise<Job[]> {
    const response = await api.get<ApiResponse<Job[]>>("/api/jobs");
    return response.data.data || [];
  },

  async getById(id: string): Promise<Job> {
    const response = await api.get<ApiResponse<Job>>(`/api/jobs/${id}`);
    return response.data.data as Job;
  },

  async create(data: JobFormData): Promise<Job> {
    const response = await api.post<ApiResponse<Job>>("/api/jobs", data);
    return response.data.data as Job;
  },

  async update(id: string, data: Partial<JobFormData>): Promise<Job> {
    const response = await api.put<ApiResponse<Job>>(`/api/jobs/${id}`, data);
    return response.data.data as Job;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/jobs/${id}`);
  },
};
