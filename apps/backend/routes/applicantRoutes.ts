import { Router } from "express";
import {
  addApplicants,
  getApplicantsByJob,
  uploadApplicants,
} from "../controllers/applicantController";
import { upload } from "../middleware/uploadMiddleware";

const router = Router();

router.post("/", addApplicants);
router.post("/upload", upload.array("files", 50), uploadApplicants);
router.get("/job/:jobId", getApplicantsByJob);

export default router;
