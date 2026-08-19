import OpenAI from "openai";

import env from "../../config/env.js";

const openai = new OpenAI({
  apiKey: env.openaiApiKey,
});

const generateImage = async ({ prompt }) => {
  if (!env.openaiImageModel) {
    throw new Error("OPENAI_IMAGE_MODEL is not configured.");
  }

  const response = await openai.images.generate({
    model: env.openaiImageModel,
    prompt,
    size: "1024x1024",
  });

  const image = response.data?.[0];

  if (!image) {
    throw new Error("OpenAI returned no generated image.");
  }

  /*
   * Some image models return a hosted URL.
   */
  if (image.url) {
    return {
      type: "url",
      value: image.url,
    };
  }

  /*
   * Some image models return base64 image data.
   */
  if (image.b64_json) {
    return {
      type: "base64",
      value: image.b64_json,
    };
  }

  throw new Error("OpenAI returned an image without URL or base64 data.");
};

export default {
  generateImage,
};
