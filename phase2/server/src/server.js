import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import designRoutes from "./routes/designRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import path from "node:path";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

await connectDatabase();

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "2mb", strict: true }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/designs", designRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/ai", aiRoutes);
app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () =>
  console.log(`API listening on http://localhost:${env.port}`),
);
