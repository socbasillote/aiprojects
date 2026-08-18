import OpenAI from "openai";

import env from "../../config/env.js";

if (!env.openaiApiKey) {
  console.warn(
    "OPENAI_API_KEY is not configured. AI generation will not work.",
  );
}

const openai = new OpenAI({
  apiKey: env.openaiApiKey,
});

export default openai;
