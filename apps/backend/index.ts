import express, { NextFunction, Request, Response } from "express";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Umurava Screener backend is running",
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(
  (error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  },
);

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});

export default app;
