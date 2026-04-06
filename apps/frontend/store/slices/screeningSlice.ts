import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { screeningService } from "@/services/screeningService";
import type { ApiError, ScoredCandidate, ScreeningResult } from "@/types";

interface ScreeningState {
  result: ScreeningResult | null;
  shortlist: ScoredCandidate[];
  screening: boolean;
  loading: boolean;
  clearing: boolean;
  error: string | null;
}

const initialState: ScreeningState = {
  result: null,
  shortlist: [],
  screening: false,
  loading: false,
  clearing: false,
  error: null,
};

const getErrorMessage = (error: unknown): string =>
  (error as ApiError)?.message || "Something went wrong";

export const triggerScreening = createAsyncThunk<
  ScoredCandidate[],
  string,
  { rejectValue: string }
>("screening/trigger", async (jobId, { rejectWithValue }) => {
  try {
    return await screeningService.trigger(jobId);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchScreeningResults = createAsyncThunk<
  ScreeningResult | null,
  string,
  { rejectValue: string }
>("screening/fetchResults", async (jobId, { rejectWithValue }) => {
  try {
    return await screeningService.getResults(jobId);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const clearStoredScreeningResults = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("screening/clearResults", async (jobId, { rejectWithValue }) => {
  try {
    await screeningService.clearResults(jobId);
    return jobId;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const screeningSlice = createSlice({
  name: "screening",
  initialState,
  reducers: {
    clearScreening(state) {
      state.result = null;
      state.shortlist = [];
      state.error = null;
      state.loading = false;
      state.screening = false;
    },
    clearScreeningError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(triggerScreening.pending, (state) => {
        state.screening = true;
        state.error = null;
      })
      .addCase(triggerScreening.fulfilled, (state, action) => {
        state.screening = false;
        state.shortlist = action.payload;
      })
      .addCase(triggerScreening.rejected, (state, action) => {
        state.screening = false;
        state.error = action.payload || "Screening failed";
      })
      .addCase(fetchScreeningResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScreeningResults.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
        state.shortlist = action.payload?.shortlist || [];
      })
      .addCase(fetchScreeningResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load screening results";
      })
      .addCase(clearStoredScreeningResults.pending, (state) => {
        state.clearing = true;
        state.error = null;
      })
      .addCase(clearStoredScreeningResults.fulfilled, (state) => {
        state.clearing = false;
        state.result = null;
        state.shortlist = [];
      })
      .addCase(clearStoredScreeningResults.rejected, (state, action) => {
        state.clearing = false;
        state.error = action.payload || "Failed to clear screening results";
      });
  },
});

export const { clearScreening, clearScreeningError } = screeningSlice.actions;
export default screeningSlice.reducer;
