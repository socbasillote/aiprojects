import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import assessmentRoutes from "./routes/assessmentRoutes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

/*
 * Health check
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Assessment AI API is running.",
  });
});

/*
 * API routes
 */

app.use("/api/assessments", assessmentRoutes);

/*
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/*
 * Global error handler
 */
app.use((error, req, res, next) => {
  console.error(error);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal server error." : error.message,
  });
});

export default app;
