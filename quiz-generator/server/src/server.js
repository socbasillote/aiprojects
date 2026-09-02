import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";

async function startServer() {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`Assessment AI server running on port ${env.port}`);
  });
}

startServer();
