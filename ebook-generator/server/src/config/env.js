import dotenv from "dotenv";

dotenv.config();

const requiredEnvVariables = ["MONGODB_URI", "JWT_SECRET"];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 5000,

  mongodbUri: process.env.MONGODB_URI,

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  jwtSecret: process.env.JWT_SECRET,

  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  openaiApiKey: process.env.OPENAI_API_KEY || "",

  openaiTextModel: process.env.OPENAI_TEXT_MODEL || "",

  openaiImageModel: process.env.OPENAI_IMAGE_MODEL || "",
};

console.log("OpenAI model:", env.openaiModel);
export default env;
