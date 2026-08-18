const TEXT_PRICING = Object.freeze({
  "gpt-5.5": {
    input: 5,
    cachedInput: 0.5,
    output: 30,
  },

  "gpt-5.6": {
    input: 5,
    cachedInput: 0.5,
    output: 30,
  },

  "gpt-5.6-sol": {
    input: 5,
    cachedInput: 0.5,
    output: 30,
  },

  "gpt-5.6-terra": {
    input: 2.5,
    cachedInput: 0.25,
    output: 15,
  },

  "gpt-5.6-luna": {
    input: 1,
    cachedInput: 0.1,
    output: 6,
  },
});

function getPricing(model) {
  return TEXT_PRICING[model] || TEXT_PRICING["gpt-5.5"];
}

function safeNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

export function normalizeUsage(usage = {}) {
  const inputTokens = safeNumber(usage.input_tokens);

  const outputTokens = safeNumber(usage.output_tokens);

  const totalTokens =
    safeNumber(usage.total_tokens) || inputTokens + outputTokens;

  const cachedInputTokens = safeNumber(
    usage.input_tokens_details?.cached_tokens,
  );

  const reasoningTokens = safeNumber(
    usage.output_tokens_details?.reasoning_tokens,
  );

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    cachedInputTokens,
    reasoningTokens,
  };
}

export function calculateTextCost({ model, usage }) {
  const normalized = normalizeUsage(usage);

  const pricing = getPricing(model);

  const regularInput = Math.max(
    0,
    normalized.inputTokens - normalized.cachedInputTokens,
  );

  const inputCost = (regularInput / 1_000_000) * pricing.input;

  const cachedInputCost =
    (normalized.cachedInputTokens / 1_000_000) * pricing.cachedInput;

  const outputCost = (normalized.outputTokens / 1_000_000) * pricing.output;

  const totalCost = inputCost + cachedInputCost + outputCost;

  return {
    ...normalized,
    inputCostUsd: inputCost,
    cachedInputCostUsd: cachedInputCost,
    outputCostUsd: outputCost,
    totalCostUsd: totalCost,
  };
}

export function calculateImageOutputCost({ size, quality }) {
  const pricing = {
    "1024x1024": {
      low: 0.006,
      medium: 0.053,
      high: 0.211,
    },

    "1024x1536": {
      low: 0.005,
      medium: 0.041,
      high: 0.165,
    },

    "1536x1024": {
      low: 0.005,
      medium: 0.041,
      high: 0.165,
    },
  };

  return pricing[size]?.[quality] ?? 0;
}

export function calculateImageCost({ model, size, quality, usage }) {
  // Current GPT Image 2 output estimates.
  const outputCost = calculateImageOutputCost({
    size,
    quality,
  });

  const normalized = normalizeUsage(usage);

  // GPT Image 2 text input is priced separately.
  const textInputCost = (normalized.inputTokens / 1_000_000) * 5;

  // Image input is only relevant for image-edit
  // requests. Keep this ready for future use.
  const imageInputTokens = safeNumber(usage?.input_image_tokens);

  const imageInputCost = (imageInputTokens / 1_000_000) * 8;

  return {
    ...normalized,
    imageInputTokens,
    outputCostUsd: outputCost,
    inputCostUsd: textInputCost + imageInputCost,
    totalCostUsd: outputCost + textInputCost + imageInputCost,
  };
}
