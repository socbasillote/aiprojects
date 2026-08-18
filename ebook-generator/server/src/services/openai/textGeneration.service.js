import OpenAI from "openai";

import env from "../../config/env.js";

const openai = new OpenAI({
  apiKey: env.openaiApiKey,
});

const generateStructuredText = async ({ systemPrompt, userPrompt }) => {
  const response = await openai.responses.create({
    model: env.openaiTextModel,

    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: `${systemPrompt}

Return the result as valid JSON.
Do not include markdown.
Do not include code fences.
The entire response must be JSON.`,
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: userPrompt,
          },
        ],
      },
    ],

    text: {
      format: {
        type: "json_object",
      },
    },
  });

  if (!response.output_text) {
    throw new Error("OpenAI returned an empty response.");
  }

  try {
    return JSON.parse(response.output_text);
  } catch (error) {
    const parseError = new Error("OpenAI returned invalid JSON.");

    parseError.cause = error;

    throw parseError;
  }
};

export default {
  generateStructuredText,
};
