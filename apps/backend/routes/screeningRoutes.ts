import { Router } from "express";
import {
  clearScreeningResults,
  getAnalytics,
  getComparisonInsight,
  getScreeningResults,
  sendCandidateEmail,
  triggerScreening,
  updateCandidateStatus,
} from "../controllers/screeningController";

const router = Router();

router.get("/analytics/summary", getAnalytics);

// Specialized POST routes FIRST
router.post("/compare-insight", getComparisonInsight);
router.post("/send-email", sendCandidateEmail);

// Greedy or general routes LAST
router.patch("/:jobId/candidate/:candidateId/status", updateCandidateStatus);
router.post("/run/:jobId", triggerScreening);
router.get("/:jobId", getScreeningResults);
router.delete("/:jobId", clearScreeningResults);

export default router;
