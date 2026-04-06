import "dotenv/config";
import cors from "cors";
import express, { Request, Response } from "express";
import { connectDB } from "./config/db";
import { errorHandler } from "./middleware/errorHandler";
import applicantRoutes from "./routes/applicantRoutes";
import jobRoutes from "./routes/jobRoutes";
import screeningRoutes from "./routes/screeningRoutes";

const app = express();
const port = Number(process.env.PORT) || 8000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Umurava Screener backend is running",
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
});

app.use("/api/jobs", jobRoutes);
app.use("/api/applicants", applicantRoutes);
app.use("/api/screening", screeningRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

export const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

if (require.main === module) {
  void startServer();
}

export default app;
