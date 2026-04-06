import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { jobService } from "@/services/jobService";
import type { ApiError, Job, JobFormData } from "@/types";

interface JobState {
  jobs: Job[];
  selectedJob: Job | null;
  loading: boolean;
  saving: boolean;
  deletingJobId: string | null;
  error: string | null;
}

const initialState: JobState = {
  jobs: [],
  selectedJob: null,
  loading: false,
  saving: false,
  deletingJobId: null,
  error: null,
};

const getErrorMessage = (error: unknown): string =>
  (error as ApiError)?.message || "Something went wrong";

export const fetchJobs = createAsyncThunk<Job[], void, { rejectValue: string }>(
  "jobs/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await jobService.getAll();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchJobById = createAsyncThunk<Job, string, { rejectValue: string }>(
  "jobs/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await jobService.getById(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createJob = createAsyncThunk<Job, JobFormData, { rejectValue: string }>(
  "jobs/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await jobService.create(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateJob = createAsyncThunk<
  Job,
  { id: string; data: Partial<JobFormData> },
  { rejectValue: string }
>("jobs/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await jobService.update(id, data);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteJob = createAsyncThunk<string, string, { rejectValue: string }>(
  "jobs/delete",
  async (id, { rejectWithValue }) => {
    try {
      await jobService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    clearSelectedJob(state) {
      state.selectedJob = null;
    },
    clearJobError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch jobs";
      })
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch job";
      })
      .addCase(createJob.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.saving = false;
        state.jobs.unshift(action.payload);
        state.selectedJob = action.payload;
      })
      .addCase(createJob.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to create job";
      })
      .addCase(updateJob.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.saving = false;
        state.jobs = state.jobs.map((job) =>
          job._id === action.payload._id ? action.payload : job,
        );
        if (state.selectedJob?._id === action.payload._id) {
          state.selectedJob = action.payload;
        }
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to update job";
      })
      .addCase(deleteJob.pending, (state, action) => {
        state.deletingJobId = action.meta.arg;
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.deletingJobId = null;
        state.jobs = state.jobs.filter((job) => job._id !== action.payload);
        if (state.selectedJob?._id === action.payload) {
          state.selectedJob = null;
        }
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.deletingJobId = null;
        state.error = action.payload || "Failed to delete job";
      });
  },
});

export const { clearSelectedJob, clearJobError } = jobSlice.actions;
export default jobSlice.reducer;
