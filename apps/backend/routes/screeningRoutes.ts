import { Router } from "express";
import {
  clearScreeningResults,
  getScreeningResults,
  triggerScreening,
} from "../controllers/screeningController";

const router = Router();

router.post("/:jobId", triggerScreening);
router.get("/:jobId", getScreeningResults);
router.delete("/:jobId", clearScreeningResults);

export default router;
