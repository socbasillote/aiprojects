import OpenAI from "openai";
import { AssetProvider } from "./AssetProvider.js";

export class OpenAIAssetProvider extends AssetProvider {
  constructor({ apiKey, model = "gpt-image-2" } = {}) {
    super();

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    this.client = new OpenAI({
      apiKey,
    });

    this.model = model;
  }

  async generateImage(prompt, { size = "1024x1024", quality = "low" } = {}) {
    const response = await this.client.images.generate({
      model: this.model,
      prompt,
      size,
      quality,
      n: 1,
    });

    const image = response.data?.[0];

    if (!image?.b64_json) {
      throw new Error("Image provider returned no image data");
    }

    const buffer = Buffer.from(image.b64_json, "base64");

    return {
      buffer,
      mimeType: "image/png",
      width: Number(size.split("x")[0]),
      height: Number(size.split("x")[1]),
      usage: response.usage ?? {},
    };
  }
}
