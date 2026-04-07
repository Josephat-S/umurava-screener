import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { screeningService } from "@/services/screeningService";
import type { AnalyticsSummary, ApiError } from "@/types";

interface AnalyticsState {
  summary: AnalyticsSummary;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  summary: {
    totalJobs: 0,
    totalApplicants: 0,
    totalScreened: 0,
    avgMatchScore: 0,
    topSkill: "—",
  },
  loading: false,
  error: null,
};

const getErrorMessage = (error: unknown): string =>
  (error as ApiError)?.message || "Something went wrong";

export const fetchAnalyticsSummary = createAsyncThunk<
  AnalyticsSummary,
  void,
  { rejectValue: string }
>("analytics/fetchSummary", async (_, { rejectWithValue }) => {
  try {
    return await screeningService.getAnalyticsSummary();
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchAnalyticsSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load analytics";
      });
  },
});

export default analyticsSlice.reducer;
