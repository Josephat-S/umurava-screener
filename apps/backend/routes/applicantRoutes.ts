import { Router } from "express";
import {
  addApplicants,
  clearApplicantsByJob,
  deleteApplicantById,
  getApplicantsByJob,
  uploadApplicants,
} from "../controllers/applicantController";
import { upload } from "../middleware/uploadMiddleware";

const router = Router();

router.post("/", addApplicants);
router.post("/upload", upload.array("files", 50), uploadApplicants);
router.get("/job/:jobId", getApplicantsByJob);
router.delete("/job/:jobId", clearApplicantsByJob);
router.delete("/job/:jobId/:applicantId", deleteApplicantById);

export default router;
