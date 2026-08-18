import { User } from "../models/User.js";
import { env } from "../config/env.js";

export const AI_CREDIT_COSTS = Object.freeze({
  generateDesign: 1,
  modifyDesign: 1,
  generateImage: 5,
});

/*
 * Rough token estimate for UI purposes.
 *
 * This is intentionally conservative.
 * The actual OpenAI response usage is authoritative.
 */
export function estimateTokensFromText(text) {
  if (!text) return 0;

  const normalized = String(text);

  /*
   * ~4 characters/token is a reasonable rough estimate
   * for mixed English/JSON content.
   */
  return Math.max(1, Math.ceil(normalized.length / 4));
}

export function calculateTextApiCost({ inputTokens, outputTokens }) {
  const inputCost =
    (Math.max(0, inputTokens) / 1_000_000) * env.aiInputPricePerMillion;

  const outputCost =
    (Math.max(0, outputTokens) / 1_000_000) * env.aiOutputPricePerMillion;

  return inputCost + outputCost;
}

export function usdToCredits(usd) {
  if (!Number.isFinite(usd) || usd <= 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(usd / env.aiCreditUsdValue));
}

export function estimateTextCredits({ inputText, maxOutputTokens }) {
  const inputTokens = estimateTokensFromText(inputText);

  const estimatedOutputTokens = Math.max(1, Number(maxOutputTokens || 0));

  const estimatedUsd = calculateTextApiCost({
    inputTokens,
    outputTokens: estimatedOutputTokens,
  });

  const credits = usdToCredits(estimatedUsd);

  const reserveCredits = Math.max(
    credits,
    Math.ceil(credits * env.aiCreditReserveMultiplier),
  );

  return {
    inputTokens,
    outputTokens: estimatedOutputTokens,
    estimatedUsd,
    credits,
    reserveCredits,
  };
}

export function calculateActualTextCredits({ inputTokens, outputTokens }) {
  const usd = calculateTextApiCost({
    inputTokens,
    outputTokens,
  });

  return {
    usd,
    credits: usdToCredits(usd),
  };
}

export async function ensureAiCredits(user) {
  if (typeof user.aiCredits === "number") {
    return user;
  }

  user.aiCredits = 20;

  await user.save();

  return user;
}

export async function reserveAiCredits(userId, amount) {
  const credits = Math.max(1, Math.ceil(amount));

  const user = await User.findOneAndUpdate(
    {
      _id: userId,
      aiCredits: {
        $gte: credits,
      },
    },
    {
      $inc: {
        aiCredits: -credits,
      },
    },
    {
      new: true,
    },
  );

  if (!user) {
    const current = await User.findById(userId).select("aiCredits");

    const remaining =
      typeof current?.aiCredits === "number" ? current.aiCredits : 0;

    const error = new Error(
      `Not enough AI credits. You need ${credits} credit${
        credits === 1 ? "" : "s"
      }, but have ${remaining}.`,
    );

    error.status = 402;
    error.code = "INSUFFICIENT_AI_CREDITS";
    error.remaining = remaining;
    error.required = credits;

    throw error;
  }

  return user.aiCredits;
}

export async function refundAiCredits(userId, amount) {
  const credits = Math.max(0, Math.ceil(amount));

  if (!credits) {
    return getAiCredits(userId);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $inc: {
        aiCredits: credits,
      },
    },
    {
      new: true,
    },
  ).select("aiCredits");

  return user?.aiCredits ?? 0;
}

export async function settleAiCredits({
  userId,
  reservedCredits,
  actualCredits,
}) {
  const reserved = Math.max(0, Math.ceil(reservedCredits));

  const actual = Math.max(0, Math.ceil(actualCredits));

  /*
   * Normal case:
   *
   * reserved = 4
   * actual   = 2
   *
   * refund 2.
   */
  if (actual < reserved) {
    return refundAiCredits(userId, reserved - actual);
  }

  /*
   * If actual somehow exceeds the
   * reservation, debit the difference.
   *
   * The reservation multiplier should
   * normally prevent this.
   */
  if (actual > reserved) {
    const additional = actual - reserved;

    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        aiCredits: {
          $gte: additional,
        },
      },
      {
        $inc: {
          aiCredits: -additional,
        },
      },
      {
        new: true,
      },
    ).select("aiCredits");

    /*
     * If the user doesn't have enough
     * credits for the difference, don't
     * silently create negative credits.
     *
     * The reservation already covered
     * the expected cost.
     */
    if (user) {
      return user.aiCredits;
    }

    return getAiCredits(userId);
  }

  return getAiCredits(userId);
}

export async function getAiCredits(userId) {
  const user = await User.findById(userId).select("aiCredits");

  return typeof user?.aiCredits === "number" ? user.aiCredits : 0;
}
