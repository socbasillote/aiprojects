import OpenAI from "openai";
import { AIProvider } from "./AIProvider.js";
import {
  DESIGN_SYSTEM_PROMPT,
  DESIGN_MODIFICATION_SYSTEM_PROMPT,
} from "./prompts.js";
import { designDocumentSchema } from "../../schemas/aiSchemas.js";
import { aiOperationsResponseSchema } from "../../schemas/aiOperationSchemas.js";

const nullable = (type) => ({
  anyOf: [type, { type: "null" }],
});

const elementProperties = {
  id: { type: "string" },

  name: nullable({
    type: "string",
    maxLength: 120,
  }),

  type: {
    type: "string",
    enum: [
      "text",
      "rect",
      "circle",
      "ellipse",
      "line",
      "image",
      "svg",
      "group",
    ],
  },

  x: { type: "number" },
  y: { type: "number" },

  width: nullable({ type: "number" }),
  height: nullable({ type: "number" }),

  rotation: nullable({ type: "number" }),

  opacity: nullable({
    type: "number",
  }),

  visible: nullable({
    type: "boolean",
  }),

  locked: nullable({
    type: "boolean",
  }),

  text: nullable({
    type: "string",
    maxLength: 2000,
  }),

  fontFamily: nullable({
    type: "string",
    maxLength: 100,
  }),

  fontSize: nullable({
    type: "number",
  }),

  fontWeight: nullable({
    type: "number",
  }),

  fill: nullable({
    type: "string",
    maxLength: 100,
  }),

  align: nullable({
    type: "string",
    enum: ["left", "center", "right"],
  }),

  lineHeight: nullable({
    type: "number",
  }),

  letterSpacing: nullable({
    type: "number",
  }),

  stroke: nullable({
    type: "string",
    maxLength: 100,
  }),

  strokeWidth: nullable({
    type: "number",
  }),

  cornerRadius: nullable({
    type: "number",
  }),

  points: nullable({
    type: "array",
    items: {
      type: "number",
    },
  }),

  src: nullable({
    type: "string",
  }),

  crop: nullable({
    type: "object",
    additionalProperties: false,
    properties: {
      x: { type: "number" },
      y: { type: "number" },
      width: { type: "number" },
      height: { type: "number" },
    },
    required: ["x", "y", "width", "height"],
  }),

  children: nullable({
    type: "array",
    items: {
      type: "string",
    },
  }),
};

const designJsonSchema = {
  type: "object",
  additionalProperties: false,

  properties: {
    version: {
      type: "integer",
    },

    canvas: {
      type: "object",
      additionalProperties: false,

      properties: {
        width: {
          type: "integer",
        },

        height: {
          type: "integer",
        },

        background: {
          type: "string",
          maxLength: 100,
        },
      },

      required: ["width", "height", "background"],
    },

    elements: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: elementProperties,
        required: Object.keys(elementProperties),
      },
    },

    elementOrder: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },

  required: ["version", "canvas", "elements", "elementOrder"],
};

const changesJsonSchema = {
  type: "object",
  additionalProperties: false,

  properties: Object.fromEntries(
    Object.entries(elementProperties)
      .filter(([key]) => !["id", "type", "children"].includes(key))
      .map(([key, schema]) => [key, schema]),
  ),

  required: Object.keys(elementProperties).filter(
    (key) => !["id", "type", "children"].includes(key),
  ),
};

const operationJsonSchema = {
  type: "object",
  additionalProperties: false,

  properties: {
    action: {
      type: "string",
      enum: [
        "add",
        "update",
        "delete",
        "move",
        "duplicate",
        "group",
        "ungroup",
        "reorder",
      ],
    },

    element: nullable({
      type: "object",
      additionalProperties: false,
      properties: elementProperties,
      required: Object.keys(elementProperties),
    }),

    elementId: nullable({
      type: "string",
    }),

    changes: nullable(changesJsonSchema),

    x: nullable({
      type: "number",
    }),

    y: nullable({
      type: "number",
    }),

    newElementId: nullable({
      type: "string",
    }),

    groupId: nullable({
      type: "string",
    }),

    elementIds: nullable({
      type: "array",
      items: {
        type: "string",
      },
    }),

    name: nullable({
      type: "string",
      maxLength: 120,
    }),

    toIndex: nullable({
      type: "integer",
    }),
  },

  required: [
    "action",
    "element",
    "elementId",
    "changes",
    "x",
    "y",
    "newElementId",
    "groupId",
    "elementIds",
    "name",
    "toIndex",
  ],
};

const operationsJsonSchema = {
  type: "object",
  additionalProperties: false,

  properties: {
    operations: {
      type: "array",
      maxItems: 50,
      items: operationJsonSchema,
    },

    summary: {
      type: "string",
      maxLength: 500,
    },
  },

  required: ["operations", "summary"],
};

function normalizeDocument(document) {
  const elements = {};
  const validIds = new Set();

  for (const raw of document.elements) {
    const element = Object.fromEntries(
      Object.entries(raw).filter(([, value]) => value !== null),
    );

    // Ensure required base fields
    if (typeof element.x !== "number") element.x = 0;
    if (typeof element.y !== "number") element.y = 0;

    // Provide sensible defaults for missing required fields based on element type
    switch (element.type) {
      case "text":
        if (!element.text) element.text = "Text";
        if (!element.fill) element.fill = "#000000";
        if (!element.fontFamily) element.fontFamily = "Arial";
        if (typeof element.fontSize !== "number") element.fontSize = 16;
        break;
      case "rect":
      case "circle":
      case "ellipse":
        if (!element.fill) element.fill = "#000000";
        if (typeof element.width !== "number") element.width = 100;
        if (typeof element.height !== "number") element.height = 100;
        break;
      case "line":
        if (!element.stroke) element.stroke = "#000000";
        if (typeof element.strokeWidth !== "number") element.strokeWidth = 1;
        if (
          !element.points ||
          !Array.isArray(element.points) ||
          element.points.length < 4
        ) {
          element.points = [0, 0, 100, 100];
        }
        break;
      case "image":
      case "svg":
        // Skip image/svg elements without valid sources
        // The prompt instructs AI not to create these without real assets
        if (!element.src || typeof element.src !== "string") {
          continue;
        }
        if (typeof element.width !== "number") element.width = 100;
        if (typeof element.height !== "number") element.height = 100;
        break;
      case "group":
        if (!element.children || !Array.isArray(element.children)) {
          element.children = [];
        }
        break;
    }

    elements[element.id] = element;
    validIds.add(element.id);
  }

  // Filter elementOrder to only include elements that passed normalization
  const elementOrder = (document.elementOrder || []).filter((id) =>
    validIds.has(id),
  );

  return {
    ...document,
    elements,
    elementOrder,
  };
}

function compactDesign(document) {
  return {
    version: document.version,

    canvas: document.canvas,

    elementOrder: document.elementOrder,

    elements: document.elementOrder
      .map((id) => {
        const element = document.elements[id];

        if (!element) {
          return null;
        }

        const copy = {
          ...element,
        };

        /*
         * Don't send the actual R2/local
         * image URL to the model.
         */
        if (copy.type === "image" || copy.type === "svg") {
          delete copy.src;
        }

        return copy;
      })
      .filter(Boolean),
  };
}

function getUsage(response) {
  const usage = response?.usage;

  return {
    inputTokens: Number(usage?.input_tokens || 0),

    outputTokens: Number(usage?.output_tokens || 0),

    totalTokens: Number(usage?.total_tokens || 0),
  };
}

export function estimateGenerateDesignInput(
  prompt,
  { width = 1080, height = 1080 } = {},
) {
  return JSON.stringify({
    instructions: DESIGN_SYSTEM_PROMPT,
    canvas: {
      width,
      height,
    },
    prompt,
  });
}

export function estimateModifyDesignInput(
  instruction,
  { design, selectedIds = [] } = {},
) {
  const compact = compactDesign(design);

  return JSON.stringify({
    instruction,
    selectedIds: selectedIds.filter((id) => Boolean(design.elements[id])),
    design: compact,
  });
}

function calculateTextCreditCost({ inputTokens, outputTokens, operation }) {
  /*
   * Application-level credit pricing.
   *
   * This is NOT the OpenAI dollar price.
   * It is your own credit system.
   *
   * Change these numbers when you want
   * to change how expensive an operation
   * is for users.
   */

  const inputRate = operation === "modifyDesign" ? 0.0005 : 0.0004;

  const outputRate = operation === "modifyDesign" ? 0.001 : 0.0008;

  const estimated = inputTokens * inputRate + outputTokens * outputRate;

  /*
   * Minimum charge is one credit.
   */
  return Math.max(1, Math.ceil(estimated));
}

export class OpenAIProvider extends AIProvider {
  constructor({ apiKey, model = "gpt-5.5" } = {}) {
    super();

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    this.client = new OpenAI({
      apiKey,
    });

    this.model = model;
  }

  async generateDesign(prompt, { width = 1080, height = 1080, signal } = {}) {
    const response = await this.client.responses.create(
      {
        model: this.model,

        instructions: [
          DESIGN_SYSTEM_PROMPT,
          `The application canvas is ${width} by ${height} pixels.`,
          "Return ONLY the requested structured design document.",
          "Do not return markdown.",
          "Do not wrap the response in code fences.",
          "All image and SVG src values must be omitted or null because assets are resolved by the application.",
        ].join("\n"),

        input: prompt,

        text: {
          format: {
            type: "json_schema",
            name: "design_document",
            strict: true,
            schema: designJsonSchema,
          },
        },
      },
      { signal },
    );

    /*
     * Responses API returns output as an array of message objects.
     * Find the message with type "message" and extract the output_text.
     */
    let raw;

    if (Array.isArray(response.output)) {
      const messageObj = response.output.find(
        (item) => item.type === "message",
      );
      if (messageObj?.content && Array.isArray(messageObj.content)) {
        const textContent = messageObj.content.find(
          (item) => item.type === "output_text",
        );
        raw = textContent?.text;
      }
    } else if (typeof response.output === "string") {
      raw = response.output;
    } else if (response.output?.text) {
      raw = response.output.text;
    }

    if (!raw) {
      console.error(
        "OpenAI returned no output.",
        JSON.stringify(
          {
            id: response.id,
            status: response.status,
            output: response.output,
            incomplete_details: response.incomplete_details,
          },
          null,
          2,
        ),
      );

      const error = new Error("AI returned no design output.");

      error.status = 502;

      throw error;
    }

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      console.error("Failed to parse OpenAI structured output:", raw);

      const parseError = new Error("AI returned invalid JSON.");

      parseError.status = 502;
      parseError.cause = error;

      throw parseError;
    }

    const normalized = normalizeDocument(parsed);

    const validated = designDocumentSchema.safeParse(normalized);

    if (!validated.success) {
      const issue = validated.error.issues[0];

      const path = issue?.path?.length ? issue.path.join(".") : "design";

      const error = new Error(
        `AI returned an invalid design at ${path}: ${
          issue?.message || "schema validation failed"
        }`,
      );

      error.status = 422;

      console.error("Invalid generated design:", validated.error.issues);

      throw error;
    }

    return {
      document: validated.data,
      usage: getUsage(response),
    };
  }

  async modifyDesign(instruction, { design, selectedIds = [] } = {}) {
    const input = estimateModifyDesignInput(instruction, {
      design,
      selectedIds,
    });

    const response = await this.client.responses.create({
      model: this.model,

      instructions: DESIGN_MODIFICATION_SYSTEM_PROMPT,

      input,

      max_output_tokens: 4000,

      text: {
        format: {
          type: "json_schema",
          name: "design_operations",
          strict: true,
          schema: operationsJsonSchema,
        },
      },
    });

    const usage = getUsage(response);

    /*
     * Responses API returns output as an array of message objects.
     * Find the message with type "message" and extract the output_text.
     */
    let raw;

    if (Array.isArray(response.output)) {
      const messageObj = response.output.find(
        (item) => item.type === "message",
      );
      if (messageObj?.content && Array.isArray(messageObj.content)) {
        const textContent = messageObj.content.find(
          (item) => item.type === "output_text",
        );
        raw = textContent?.text;
      }
    } else if (typeof response.output === "string") {
      raw = response.output;
    } else if (response.output?.text) {
      raw = response.output.text;
    }

    if (!raw) {
      throw new Error("AI returned no operations output.");
    }

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("AI returned invalid JSON");
    }

    const validated = aiOperationsResponseSchema.safeParse(parsed);

    if (!validated.success) {
      const issue = validated.error.issues[0];

      const path = issue?.path?.length ? issue.path.join(".") : "operations";

      throw new Error(
        `AI returned invalid operations at ${path}: ${
          issue?.message || "schema validation failed"
        }`,
      );
    }

    return {
      ...validated.data,
      usage,
    };
  }
  async estimateCredits({
    operation,
    prompt,
    design,
    selectedIds = [],
    canvas,
  }) {
    const compact =
      operation === "modifyDesign" && design ? compactDesign(design) : null;

    const input = JSON.stringify({
      operation,
      prompt,
      selectedIds,
      canvas,
      ...(compact ? { design: compact } : {}),
    });

    /*
     * This is an estimate.
     *
     * We deliberately don't make another OpenAI
     * API request just to calculate tokens.
     * The tokenizer approximation is handled locally.
     */
    const inputTokens = Math.ceil(input.length / 4);

    /*
     * Reserve enough output capacity for the
     * structured response.
     */
    const outputTokens = operation === "modifyDesign" ? 4000 : 3000;

    /*
     * Convert token usage to application credits.
     *
     * Keep this mapping in one place so you can
     * change pricing later without changing UI.
     */
    const credits = calculateTextCreditCost({
      inputTokens,
      outputTokens,
      operation,
    });

    return {
      credits,
      reserveCredits: credits,
      inputTokens,
      outputTokens,
    };
  }
}
