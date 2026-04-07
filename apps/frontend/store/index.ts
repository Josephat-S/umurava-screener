import { configureStore } from "@reduxjs/toolkit";
import applicantReducer from "@/store/slices/applicantSlice";
import analyticsReducer from "@/store/slices/analyticsSlice";
import jobReducer from "@/store/slices/jobSlice";
import screeningReducer from "@/store/slices/screeningSlice";

export const store = configureStore({
  reducer: {
    jobs: jobReducer,
    applicants: applicantReducer,
    screening: screeningReducer,
    analytics: analyticsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
