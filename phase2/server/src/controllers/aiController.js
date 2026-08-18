import { z } from "zod";
import {
  OpenAIProvider,
  estimateGenerateDesignInput,
  estimateModifyDesignInput,
} from "../services/ai/OpenAIProvider.js";
import { designDocumentSchema } from "../schemas/aiSchemas.js";
import { aiOperationsResponseSchema } from "../schemas/aiOperationSchemas.js";
import { env } from "../config/env.js";
import { OpenAIAssetProvider } from "../services/ai/OpenAIAssetProvider.js";
import { Asset } from "../models/Asset.js";
import { randomUUID } from "node:crypto";
import { putBuffer, deleteObject } from "../services/storage.js";
import {
  getAiCredits,
  refundAiCredits,
  reserveAiCredits,
  settleAiCredits,
  estimateTextCredits,
  calculateActualTextCredits,
} from "../utils/aiCredits.js";

const generateSchema = z.object({
  prompt: z.string().trim().min(3).max(4000),

  canvas: z
    .object({
      width: z.number().int().min(1).max(10000),
      height: z.number().int().min(1).max(10000),
    })
    .optional(),
});

const generateImageSchema = z.object({
  prompt: z.string().trim().min(3).max(2000),

  size: z.enum(["1024x1024", "1024x1536", "1536x1024"]).default("1024x1024"),

  quality: z.enum(["low", "medium", "high"]).default("low"),
});

const modifySchema = z.object({
  instruction: z.string().trim().min(2).max(2000),

  selectedIds: z.array(z.string().min(1)).max(50).default([]),

  design: designDocumentSchema,
});

const estimateSchema = z.object({
  operation: z.enum(["generateDesign", "modifyDesign", "generateImage"]),

  prompt: z.string().trim().min(3).max(4000),

  canvas: z
    .object({
      width: z.number().int().min(1).max(10000),
      height: z.number().int().min(1).max(10000),
    })
    .optional(),

  design: designDocumentSchema.optional(),

  selectedIds: z.array(z.string().min(1)).max(50).optional(),

  size: z.enum(["1024x1024", "1024x1536", "1536x1024"]).optional(),

  quality: z.enum(["low", "medium", "high"]).optional(),
});

function clone(value) {
  return structuredClone(value);
}

function applyOperation(document, operation) {
  const next = clone(document);

  const has = (id) => Boolean(next.elements[id]);

  switch (operation.action) {
    case "add":
      if (has(operation.element.id)) {
        throw new Error(
          `Cannot add element ${operation.element.id}: ID already exists`,
        );
      }

      next.elements[operation.element.id] = operation.element;

      next.elementOrder.push(operation.element.id);

      break;

    case "update":
      if (!has(operation.elementId)) {
        throw new Error(`Unknown element ID: ${operation.elementId}`);
      }

      Object.assign(next.elements[operation.elementId], operation.changes);

      break;

    case "delete":
      if (!has(operation.elementId)) {
        throw new Error(`Unknown element ID: ${operation.elementId}`);
      }

      delete next.elements[operation.elementId];

      next.elementOrder = next.elementOrder.filter(
        (id) => id !== operation.elementId,
      );

      for (const element of Object.values(next.elements)) {
        if (element.type === "group" && Array.isArray(element.children)) {
          element.children = element.children.filter(
            (id) => id !== operation.elementId,
          );
        }
      }

      break;

    case "move":
      if (!has(operation.elementId)) {
        throw new Error(`Unknown element ID: ${operation.elementId}`);
      }

      next.elements[operation.elementId].x = operation.x;

      next.elements[operation.elementId].y = operation.y;

      break;

    case "duplicate": {
      if (!has(operation.elementId)) {
        throw new Error(`Unknown element ID: ${operation.elementId}`);
      }

      if (has(operation.newElementId)) {
        throw new Error(
          `Duplicate target ID already exists: ${operation.newElementId}`,
        );
      }

      const source = next.elements[operation.elementId];

      next.elements[operation.newElementId] = {
        ...clone(source),
        ...operation.changes,
        id: operation.newElementId,
        x: (source.x || 0) + 24,
        y: (source.y || 0) + 24,
      };

      const index = next.elementOrder.indexOf(operation.elementId);

      next.elementOrder.splice(index + 1, 0, operation.newElementId);

      break;
    }

    case "group": {
      if (has(operation.groupId)) {
        throw new Error(`Group ID already exists: ${operation.groupId}`);
      }

      const ids = [...new Set(operation.elementIds)];

      if (ids.length < 2 || ids.some((id) => !has(id))) {
        throw new Error("Group contains invalid element IDs");
      }

      const group = {
        id: operation.groupId,
        type: "group",
        name: operation.name || "Group",
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        children: ids,
      };

      next.elements[operation.groupId] = group;

      const firstIndex = next.elementOrder.indexOf(ids[0]);

      next.elementOrder.splice(Math.max(firstIndex, 0), 0, operation.groupId);

      break;
    }

    case "ungroup": {
      const group = next.elements[operation.groupId];

      if (!group || group.type !== "group") {
        throw new Error(`Unknown group ID: ${operation.groupId}`);
      }

      delete next.elements[operation.groupId];

      next.elementOrder = next.elementOrder.filter(
        (id) => id !== operation.groupId,
      );

      break;
    }

    case "reorder": {
      if (!has(operation.elementId)) {
        throw new Error(`Unknown element ID: ${operation.elementId}`);
      }

      const order = next.elementOrder.filter(
        (id) => id !== operation.elementId,
      );

      const target = Math.min(Math.max(operation.toIndex, 0), order.length);

      order.splice(target, 0, operation.elementId);

      next.elementOrder = order;

      break;
    }

    default:
      throw new Error(`Unsupported operation: ${operation.action}`);
  }

  return next;
}

/*
 * GET/POST this endpoint from the client
 * before executing an AI request.
 */
export async function estimateAiCost(req, res) {
  if (!env.openaiApiKey) {
    return res.status(503).json({
      message: "AI generation is not configured.",
    });
  }

  const input = estimateSchema.parse(req.body);

  let estimate;

  if (input.operation === "generateDesign") {
    const canvas = input.canvas || {
      width: 1080,
      height: 1080,
    };

    const text = estimateGenerateDesignInput(input.prompt, canvas);

    estimate = estimateTextCredits({
      inputText: text,
      maxOutputTokens: 6000,
    });
  }

  if (input.operation === "modifyDesign") {
    if (!input.design) {
      return res.status(400).json({
        message: "Design is required for modifyDesign estimates.",
      });
    }

    const text = estimateModifyDesignInput(input.prompt, {
      design: input.design,
      selectedIds: input.selectedIds || [],
    });

    estimate = estimateTextCredits({
      inputText: text,
      maxOutputTokens: 4000,
    });
  }

  if (input.operation === "generateImage") {
    /*
     * GPT Image 2 uses image-generation
     * pricing rather than the text-token
     * pricing above.
     *
     * Keep the existing product credit
     * model for image generation.
     */
    const quality = input.quality || "low";

    const imageCredits = quality === "high" ? 12 : quality === "medium" ? 7 : 5;

    estimate = {
      inputTokens: null,
      outputTokens: null,
      estimatedUsd: null,
      credits: imageCredits,
      reserveCredits: Math.ceil(imageCredits * env.aiCreditReserveMultiplier),
    };
  }

  const remaining = await getAiCredits(req.user._id);

  res.json({
    estimate: {
      credits: estimate.credits,

      reserveCredits: estimate.reserveCredits,

      inputTokens: estimate.inputTokens,

      outputTokens: estimate.outputTokens,

      estimatedUsd: estimate.estimatedUsd,

      remaining,

      enoughCredits: remaining >= estimate.reserveCredits,
    },
  });
}

export async function generateDesign(req, res) {
  if (!env.openaiApiKey) {
    return res.status(503).json({
      message:
        "AI generation is not configured. Add OPENAI_API_KEY to the server environment.",
    });
  }

  const input = generateSchema.parse(req.body);

  const inputText = estimateGenerateDesignInput(
    input.prompt,
    input.canvas || {},
  );

  const estimate = estimateTextCredits({
    inputText,
    maxOutputTokens: 6000,
  });

  const reservedCredits = estimate.reserveCredits;

  await reserveAiCredits(req.user._id, reservedCredits);

  const abortController = new AbortController();
  let clientDisconnected = false;

  const abortWhenClientDisconnects = () => {
    if (!res.writableEnded) {
      clientDisconnected = true;
      abortController.abort();
    }
  };

  res.once("close", abortWhenClientDisconnects);

  try {
    const provider = new OpenAIProvider({
      apiKey: env.openaiApiKey,
      model: env.openaiModel,
    });

    const result = await provider.generateDesign(
      input.prompt,
      { ...input.canvas, signal: abortController.signal },
    );

    designDocumentSchema.parse(result.document);

    const actual = calculateActualTextCredits({
      inputTokens: result.usage.inputTokens,

      outputTokens: result.usage.outputTokens,
    });

    const remaining = await settleAiCredits({
      userId: req.user._id,
      reservedCredits,
      actualCredits: actual.credits,
    });

    res.json({
      document: result.document,

      credits: {
        estimated: estimate.credits,

        reserved: reservedCredits,

        actual: actual.credits,

        remaining,
      },

      usage: result.usage,
    });
  } catch (error) {
    await refundAiCredits(req.user._id, reservedCredits);

    if (clientDisconnected) {
      return;
    }

    throw error;
  } finally {
    res.off("close", abortWhenClientDisconnects);
  }
}

export async function generateImage(req, res) {
  if (!env.openaiApiKey) {
    return res.status(503).json({
      message:
        "AI image generation is not configured. Add OPENAI_API_KEY to the server environment.",
    });
  }

  const input = generateImageSchema.parse(req.body);

  /*
   * Image credits remain product-based.
   * They can later be changed according
   * to actual GPT Image 2 pricing.
   */
  const cost =
    input.quality === "high" ? 12 : input.quality === "medium" ? 7 : 5;

  await reserveAiCredits(req.user._id, cost);

  try {
    const provider = new OpenAIAssetProvider({
      apiKey: env.openaiApiKey,
      model: env.openaiImageModel,
    });

    const generated = await provider.generateImage(input.prompt, {
      size: input.size,
      quality: input.quality,
    });

    if (
      !Buffer.isBuffer(generated.buffer) ||
      generated.buffer.length > 20 * 1024 * 1024
    ) {
      throw new Error("Generated image is too large.");
    }

    const storageKey = `users/${req.user._id.toString()}/assets/${randomUUID()}.png`;

    const stored = await putBuffer({
      key: storageKey,
      body: generated.buffer,
      contentType: generated.mimeType,
    });

    let asset;

    try {
      asset = await Asset.create({
        userId: req.user._id,
        type: "image",
        storageProvider: stored.provider,
        storageKey: stored.key,
        url: stored.url,
        name: `AI image - ${new Date().toISOString().slice(0, 10)}`,
        width: generated.width,
        height: generated.height,
        mimeType: generated.mimeType,
        size: generated.buffer.length,
      });
    } catch (error) {
      await deleteObject({
        provider: stored.provider,
        key: stored.key,
        url: stored.url,
      }).catch(() => {});

      throw error;
    }

    const remaining = await getAiCredits(req.user._id);

    res.status(201).json({
      asset: {
        id: asset._id.toString(),
        type: asset.type,
        name: asset.name,
        mimeType: asset.mimeType,
        size: asset.size,
        width: asset.width,
        height: asset.height,
        url: asset.url,
        createdAt: asset.createdAt,
      },

      credits: {
        cost,
        estimated: cost,
        actual: cost,
        remaining,
      },
    });
  } catch (error) {
    await refundAiCredits(req.user._id, cost);

    throw error;
  }
}

export async function modifyDesign(req, res) {
  if (!env.openaiApiKey) {
    return res.status(503).json({
      message:
        "AI generation is not configured. Add OPENAI_API_KEY to the server environment.",
    });
  }

  const input = modifySchema.parse(req.body);

  const inputText = estimateModifyDesignInput(input.instruction, {
    design: input.design,
    selectedIds: input.selectedIds,
  });

  const estimate = estimateTextCredits({
    inputText,
    maxOutputTokens: 4000,
  });

  const reservedCredits = estimate.reserveCredits;

  await reserveAiCredits(req.user._id, reservedCredits);

  try {
    const provider = new OpenAIProvider({
      apiKey: env.openaiApiKey,
      model: env.openaiModel,
    });

    const result = await provider.modifyDesign(input.instruction, {
      design: input.design,
      selectedIds: input.selectedIds,
    });

    let simulated = clone(input.design);

    try {
      for (const operation of result.operations) {
        simulated = applyOperation(simulated, operation);
      }

      designDocumentSchema.parse(simulated);
    } catch (error) {
      const rejection = new Error(
        `AI operations were rejected: ${error.message}`,
      );

      rejection.status = 422;

      throw rejection;
    }

    aiOperationsResponseSchema.parse(result);

    const actual = calculateActualTextCredits({
      inputTokens: result.usage.inputTokens,

      outputTokens: result.usage.outputTokens,
    });

    const remaining = await settleAiCredits({
      userId: req.user._id,
      reservedCredits,
      actualCredits: actual.credits,
    });

    res.json({
      ...result,

      usage: result.usage,

      credits: {
        estimated: estimate.credits,

        reserved: reservedCredits,

        actual: actual.credits,

        remaining,
      },
    });
  } catch (error) {
    await refundAiCredits(req.user._id, reservedCredits);

    throw error;
  }
}
export async function estimateAiCredits(req, res) {
  if (!env.openaiApiKey) {
    return res.status(503).json({
      message:
        "AI generation is not configured. Add OPENAI_API_KEY to the server environment.",
    });
  }

  const input = z
    .object({
      operation: z.enum(["generateDesign", "modifyDesign", "generateImage"]),
      prompt: z.string().trim().min(3).max(4000),
      canvas: z
        .object({
          width: z.number().int().min(1).max(10000),
          height: z.number().int().min(1).max(10000),
        })
        .optional(),
      selectedIds: z.array(z.string().min(1)).max(50).optional(),
      design: designDocumentSchema.optional(),
      size: z.enum(["1024x1024", "1024x1536", "1536x1024"]).optional(),
      quality: z.enum(["low", "medium", "high"]).optional(),
    })
    .parse(req.body);

  /*
   * Image generation is not token-priced the same
   * way as text generation, so use the configured
   * image credit cost.
   */
  if (input.operation === "generateImage") {
    const quality = input.quality || "low";

    const cost = quality === "high" ? 12 : quality === "medium" ? 7 : 5;

    return res.json({
      operation: input.operation,
      credits: cost,
      reserveCredits: cost,
      inputTokens: null,
      outputTokens: null,
      reason: `Image generation (${quality} quality)`,
    });
  }

  /*
   * For text operations, estimate tokens using
   * the same compact representation sent to OpenAI.
   */
  const provider = new OpenAIProvider({
    apiKey: env.openaiApiKey,
    model: env.openaiModel,
  });

  const estimate = await provider.estimateCredits({
    operation: input.operation,
    prompt: input.prompt,
    design: input.design,
    selectedIds: input.selectedIds || [],
    canvas: input.canvas,
  });

  res.json({
    operation: input.operation,
    ...estimate,
  });
}
