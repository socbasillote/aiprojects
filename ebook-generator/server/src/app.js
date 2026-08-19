import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import env from "./config/env.js";

import healthRoutes from "./routes/health.routes.js";
import ebookRoutes from "./routes/ebook.routes.js";

import notFoundMiddleware from "./middleware/notFound.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

app.use(helmet());

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

/*
|--------------------------------------------------------------------------
| Logging
|--------------------------------------------------------------------------
*/

if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

/*
|--------------------------------------------------------------------------
| Body Parsing
|--------------------------------------------------------------------------
*/

app.use(express.json({ limit: "2mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  }),
);

/*
|--------------------------------------------------------------------------
| Cookies
|--------------------------------------------------------------------------
*/

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/api/health", healthRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/ebooks", ebookRoutes);

/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use(notFoundMiddleware);

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorMiddleware);

export default app;
