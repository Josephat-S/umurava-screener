import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { screeningService } from "@/services/screeningService";
import type { RootState } from "@/store";
import type {
  ApiError,
  CandidateStatus,
  ScoredCandidate,
  ScoringWeights,
  ScreeningResult,
} from "@/types";

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  skills: 40,
  experience: 30,
  education: 15,
  profile: 15,
};

interface ScreeningState {
  result: ScreeningResult | null;
  shortlist: ScoredCandidate[];
  screening: boolean;
  loading: boolean;
  clearing: boolean;
  updatingCandidateId: string | null;
  weightsByJobId: Record<string, ScoringWeights>;
  error: string | null;
}

const initialState: ScreeningState = {
  result: null,
  shortlist: [],
  screening: false,
  loading: false,
  clearing: false,
  updatingCandidateId: null,
  weightsByJobId: {},
  error: null,
};

const getErrorMessage = (error: unknown): string =>
  (error as ApiError)?.message || "Something went wrong";

export const triggerScreening = createAsyncThunk<
  ScoredCandidate[],
  string,
  { rejectValue: string; state: RootState }
>("screening/trigger", async (jobId, { getState, rejectWithValue }) => {
  try {
    const weights =
      getState().screening.weightsByJobId[jobId] || DEFAULT_SCORING_WEIGHTS;
    return await screeningService.trigger(jobId, weights);
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

export const updateScreeningCandidateStatus = createAsyncThunk<
  ScreeningResult,
  { jobId: string; candidateId: string; status: CandidateStatus },
  { rejectValue: string }
>(
  "screening/updateCandidateStatus",
  async ({ jobId, candidateId, status }, { rejectWithValue }) => {
    try {
      return await screeningService.updateCandidateStatus(jobId, candidateId, status);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

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
      state.updatingCandidateId = null;
    },
    clearScreeningError(state) {
      state.error = null;
    },
    setWeightsForJob(
      state,
      action: PayloadAction<{ jobId: string; weights: ScoringWeights }>,
    ) {
      state.weightsByJobId[action.payload.jobId] = action.payload.weights;
    },
    resetWeightsForJob(state, action: PayloadAction<string>) {
      state.weightsByJobId[action.payload] = DEFAULT_SCORING_WEIGHTS;
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
      })
      .addCase(updateScreeningCandidateStatus.pending, (state, action) => {
        state.updatingCandidateId = action.meta.arg.candidateId;
        state.error = null;
      })
      .addCase(updateScreeningCandidateStatus.fulfilled, (state, action) => {
        state.updatingCandidateId = null;
        state.result = action.payload;
        state.shortlist = action.payload.shortlist || [];
      })
      .addCase(updateScreeningCandidateStatus.rejected, (state, action) => {
        state.updatingCandidateId = null;
        state.error = action.payload || "Failed to update candidate status";
      });
  },
});

export const {
  clearScreening,
  clearScreeningError,
  setWeightsForJob,
  resetWeightsForJob,
} = screeningSlice.actions;
export default screeningSlice.reducer;
