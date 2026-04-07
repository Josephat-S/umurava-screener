import { Router } from "express";
import {
  clearScreeningResults,
  getAnalytics,
  getScreeningResults,
  triggerScreening,
  updateCandidateStatus,
} from "../controllers/screeningController";

const router = Router();

router.get("/analytics/summary", getAnalytics);
router.patch("/:jobId/candidate/:candidateId/status", updateCandidateStatus);
router.post("/:jobId", triggerScreening);
router.get("/:jobId", getScreeningResults);
router.delete("/:jobId", clearScreeningResults);

export default router;
