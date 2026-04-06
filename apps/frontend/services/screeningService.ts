import api from "@/services/api";
import type { ApiError, ApiResponse, ScoredCandidate, ScreeningResult } from "@/types";

export const screeningService = {
  async trigger(jobId: string): Promise<ScoredCandidate[]> {
    const response = await api.post<ApiResponse<ScoredCandidate[]>>(
      `/api/screening/${jobId}`,
    );
    return response.data.data || [];
  },

  async getResults(jobId: string): Promise<ScreeningResult | null> {
    try {
      const response = await api.get<ApiResponse<ScreeningResult>>(
        `/api/screening/${jobId}`,
      );
      return response.data.data || null;
    } catch (error) {
      const typedError = error as ApiError;

      if (typedError.status === 404) {
        return null;
      }

      throw error;
    }
  },

  async clearResults(jobId: string): Promise<void> {
    await api.delete(`/api/screening/${jobId}`);
  },
};
