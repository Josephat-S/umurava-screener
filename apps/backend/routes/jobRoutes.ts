import { Router } from "express";
import {
  createJob,
  deleteJob,
  getJobById,
  getJobs,
  parseJobDescription,
  updateJob,
} from "../controllers/jobController";

const router = Router();

router.post("/parse", parseJobDescription);
router.post("/", createJob);
router.get("/", getJobs);
router.get("/:id", getJobById);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

export default router;
