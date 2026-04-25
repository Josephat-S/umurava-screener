import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { applicantService } from "@/services/applicantService";
import type { ApiError, Applicant, StructuredApplicantInput } from "@/types";

interface ApplicantState {
  applicants: Applicant[];
  loading: boolean;
  uploading: boolean;
  adding: boolean;
  deletingApplicantId: string | null;
  clearingJobId: string | null;
  error: string | null;
}

const initialState: ApplicantState = {
  applicants: [],
  loading: false,
  uploading: false,
  adding: false,
  deletingApplicantId: null,
  clearingJobId: null,
  error: null,
};

const getErrorMessage = (error: unknown): string =>
  (error as ApiError)?.message || "Something went wrong";

export const fetchApplicants = createAsyncThunk<
  Applicant[],
  string,
  { rejectValue: string }
>("applicants/fetchByJob", async (jobId, { rejectWithValue }) => {
  try {
    return await applicantService.getByJob(jobId);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const addStructuredApplicants = createAsyncThunk<
  Applicant[],
  { jobId: string; applicants: StructuredApplicantInput[] },
  { rejectValue: string }
>("applicants/addStructured", async ({ jobId, applicants }, { rejectWithValue }) => {
  try {
    return await applicantService.addStructured(jobId, applicants);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const uploadApplicantFiles = createAsyncThunk<
  { data: Applicant[]; message?: string },
  { jobId: string; files: File[]; resumeLinks?: string[] },
  { rejectValue: string }
>("applicants/upload", async ({ jobId, files, resumeLinks }, { rejectWithValue }) => {
  try {
    return await applicantService.uploadFiles(jobId, files, resumeLinks);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteApplicant = createAsyncThunk<
  string,
  { jobId: string; applicantId: string },
  { rejectValue: string }
>("applicants/delete", async ({ jobId, applicantId }, { rejectWithValue }) => {
  try {
    await applicantService.deleteById(jobId, applicantId);
    return applicantId;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const clearApplicantsForJob = createAsyncThunk<
  number,
  string,
  { rejectValue: string }
>("applicants/clearByJob", async (jobId, { rejectWithValue }) => {
  try {
    return await applicantService.clearByJob(jobId);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const applicantSlice = createSlice({
  name: "applicants",
  initialState,
  reducers: {
    clearApplicants(state) {
      state.applicants = [];
    },
    clearApplicantError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplicants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicants.fulfilled, (state, action) => {
        state.loading = false;
        state.applicants = action.payload;
      })
      .addCase(fetchApplicants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load applicants";
      })
      .addCase(addStructuredApplicants.pending, (state) => {
        state.adding = true;
        state.error = null;
      })
      .addCase(addStructuredApplicants.fulfilled, (state, action) => {
        state.adding = false;
        state.applicants.unshift(...action.payload);
      })
      .addCase(addStructuredApplicants.rejected, (state, action) => {
        state.adding = false;
        state.error = action.payload || "Failed to add applicants";
      })
      .addCase(uploadApplicantFiles.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadApplicantFiles.fulfilled, (state, action) => {
        state.uploading = false;
        state.applicants.unshift(...action.payload.data);
      })
      .addCase(uploadApplicantFiles.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload || "Upload failed";
      })
      .addCase(deleteApplicant.pending, (state, action) => {
        state.deletingApplicantId = action.meta.arg.applicantId;
        state.error = null;
      })
      .addCase(deleteApplicant.fulfilled, (state, action) => {
        state.deletingApplicantId = null;
        state.applicants = state.applicants.filter(
          (applicant) => applicant._id !== action.payload,
        );
      })
      .addCase(deleteApplicant.rejected, (state, action) => {
        state.deletingApplicantId = null;
        state.error = action.payload || "Failed to delete applicant";
      })
      .addCase(clearApplicantsForJob.pending, (state, action) => {
        state.clearingJobId = action.meta.arg;
        state.error = null;
      })
      .addCase(clearApplicantsForJob.fulfilled, (state) => {
        state.clearingJobId = null;
        state.applicants = [];
      })
      .addCase(clearApplicantsForJob.rejected, (state, action) => {
        state.clearingJobId = null;
        state.error = action.payload || "Failed to clear applicants";
      });
  },
});

export const { clearApplicants, clearApplicantError } = applicantSlice.actions;
export default applicantSlice.reducer;
