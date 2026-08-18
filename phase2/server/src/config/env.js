import "dotenv/config";

const required = ["MONGODB_URI", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`${key} is required in the environment`);
  }
}

const isProduction = process.env.NODE_ENV === "production";

if (isProduction && String(process.env.JWT_SECRET).length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters in production");
}

if (isProduction && !(process.env.CLIENT_ORIGIN || "").startsWith("https://")) {
  throw new Error("CLIENT_ORIGIN must use HTTPS in production");
}

export const env = {
  port: Number(process.env.PORT || 4000),

  mongoUri: process.env.MONGODB_URI,

  jwtSecret: process.env.JWT_SECRET,

  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",

  openaiApiKey: process.env.OPENAI_API_KEY || "",

  openaiModel: process.env.OPENAI_MODEL || "gpt-5.5",

  openaiImageModel: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",

  /*
   * AI credit economics
   *
   * 1 credit represents this much internal AI budget.
   *
   * Example:
   * AI_CREDIT_USD_VALUE=0.05
   *
   * means one credit represents $0.05 of AI API budget.
   *
   * This is NOT the same as the customer's package price.
   */
  aiCreditUsdValue: Number(process.env.AI_CREDIT_USD_VALUE || 0.05),

  /*
   * Current GPT-5.5 standard API pricing.
   *
   * These are intentionally configurable so you don't need
   * to modify application code when model pricing changes.
   */
  aiInputPricePerMillion: Number(process.env.AI_INPUT_PRICE_PER_MILLION || 5),

  aiOutputPricePerMillion: Number(
    process.env.AI_OUTPUT_PRICE_PER_MILLION || 30,
  ),

  /*
   * Safety margin applied to estimates before reservation.
   *
   * Example:
   * 1.20 = reserve 20% above the estimate.
   */
  aiCreditReserveMultiplier: Number(
    process.env.AI_CREDIT_RESERVE_MULTIPLIER || 1.2,
  ),

  paypalClientId: process.env.PAYPAL_CLIENT_ID || "",

  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || "",

  paypalEnvironment: process.env.PAYPAL_ENVIRONMENT || "sandbox",

  storageProvider: process.env.STORAGE_PROVIDER || "local",

  r2AccountId: process.env.R2_ACCOUNT_ID || "",

  r2Endpoint: process.env.R2_ENDPOINT || "",

  r2Bucket: process.env.R2_BUCKET || "",

  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || "",

  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",

  r2PublicBaseUrl: process.env.R2_PUBLIC_BASE_URL || "",

  isProduction,
};
