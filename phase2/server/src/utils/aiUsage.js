import { AiUsage } from "../models/AiUsage.js";
import { calculateTextCost, calculateImageCost } from "./aiPricing.js";

export async function recordAiUsage({
  userId,
  operation,
  model,
  usage = {},
  creditsCharged,
  metadata = {},
  costUsd,
}) {
  const isImage = operation === "generateImage";

  const pricing = isImage
    ? calculateImageCost({
        model,
        size: metadata.size,
        quality: metadata.quality,
        usage,
      })
    : calculateTextCost({
        model,
        usage,
      });

  return AiUsage.create({
    userId,
    operation,
    model,

    inputTokens: pricing.inputTokens ?? 0,

    outputTokens: pricing.outputTokens ?? 0,

    totalTokens: pricing.totalTokens ?? 0,

    cachedInputTokens: pricing.cachedInputTokens ?? 0,

    reasoningTokens: pricing.reasoningTokens ?? 0,

    costUsd: Number.isFinite(costUsd) ? costUsd : pricing.totalCostUsd,

    creditsCharged,

    metadata,
  });
}
