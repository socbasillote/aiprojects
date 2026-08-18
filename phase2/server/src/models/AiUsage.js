import mongoose from "mongoose";

const aiUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    operation: {
      type: String,
      enum: ["generateDesign", "modifyDesign", "generateImage"],
      required: true,
      index: true,
    },

    model: {
      type: String,
      required: true,
    },

    inputTokens: {
      type: Number,
      default: 0,
      min: 0,
    },

    outputTokens: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalTokens: {
      type: Number,
      default: 0,
      min: 0,
    },

    cachedInputTokens: {
      type: Number,
      default: 0,
      min: 0,
    },

    reasoningTokens: {
      type: Number,
      default: 0,
      min: 0,
    },

    costUsd: {
      type: Number,
      default: 0,
      min: 0,
    },

    creditsCharged: {
      type: Number,
      required: true,
      min: 0,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

aiUsageSchema.index({
  userId: 1,
  createdAt: -1,
});

aiUsageSchema.index({
  operation: 1,
  createdAt: -1,
});

export const AiUsage = mongoose.model("AiUsage", aiUsageSchema);
