import api from "@/services/api";
import type {
  AnalyticsSummary,
  ApiError,
  ApiResponse,
  CandidateStatus,
  ScoredCandidate,
  ScoringWeights,
  ScreeningResult,
} from "@/types";

export const screeningService = {
  async trigger(jobId: string, weights: ScoringWeights): Promise<ScoredCandidate[]> {
    const response = await api.post<ApiResponse<ScoredCandidate[]>>(
      `/api/screening/${jobId}`,
      { weights },
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

  async updateCandidateStatus(
    jobId: string,
    candidateId: string,
    status: CandidateStatus,
  ): Promise<ScreeningResult> {
    const response = await api.patch<ApiResponse<ScreeningResult>>(
      `/api/screening/${jobId}/candidate/${candidateId}/status`,
      { status },
    );
    return response.data.data as ScreeningResult;
  },

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const response = await api.get<ApiResponse<AnalyticsSummary>>(
      "/api/screening/analytics/summary",
    );
    return response.data.data as AnalyticsSummary;
  },
};
