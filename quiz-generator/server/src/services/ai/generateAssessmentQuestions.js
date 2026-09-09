import { openai } from "../../config/openai.js";
import { planQuestionContent } from "./questionContentPlanner.js";
import { validateMathQuestion } from "./mathValidation.js";

import { generatedQuestionsSchema } from "../../validators/generatedQuestionsValidator.js";

function createPrompt({
  subject,
  gradeLevel,
  topic,
  questionCount,
  questionTypes,
  difficulty,
  language,
  instructions,
  contentMode = "text",
  imageMode = "none",
  mathSolutionLayout = "top_to_bottom",
}) {
  const contentPlan = planQuestionContent({
    subject,
    topic,
    gradeLevel,
    difficulty,
    contentMode,
  });
  return `
Generate an educational assessment.

Subject:
${subject}

Grade level:
${gradeLevel}

Topic:
${topic}

Number of questions:
${questionCount}

Allowed question types:
${questionTypes.join(", ")}


Allowed content types:
${contentPlan.allowed.join(", ")}

Image preference:
${imageMode}

Math solution layout:
${mathSolutionLayout}
Difficulty:
${difficulty}

Language:
${language}

Additional instructions:
${instructions || "None"}

Requirements:

- Generate exactly ${questionCount} questions.
- Use only the requested question types.
- Match the requested grade level.
- Match the requested difficulty.
- Write all content in ${language}.
- Each question must have a unique id.
- Orders must start at 1 and increase sequentially.
- Multiple choice questions must contain answer options.
- True/false questions must contain the appropriate answer.
- Short answer, essay, and fill-in-the-blank questions should not contain unnecessary options.
- Include the correct answer where applicable.
- Include a concise explanation.
- Assign a reasonable point value.

- Set contentType to one of the allowed content types. Use visual only when it improves the question for the subject and topic.
- For math content, include math.expression, math.solution, math.unit, and math.tolerance. The solution must be independently calculable from the expression.
- For math content, use a plain numeric expression with +, -, *, /, ^, parentheses, or a simple fraction. Put only the numeric answer in math.solution; put measurement units in math.unit. Do not put explanatory text in either field.
- For math content, set math.solutionLayout to ${mathSolutionLayout}.
- For math content, return only the problem in content. Do not add per-question instructions such as "solve", "show your work", or numbered steps; those belong to the section instructions.
- For visual content, include an asset with a useful prompt, accurate altText, source, and URL only when available.
- Respect the image preference. Generate no image assets when it is none; use grayscale prompts for black_and_white and full-color prompts for color.
Return only data matching the requested structured schema.
`;
}

export async function generateAssessmentQuestions(input) {
  const prompt = createPrompt(input);

  const response = await openai.responses.create({
    model: "gpt-5-mini",

    input: [
      {
        role: "system",
        content: "You generate high-quality educational assessment questions.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],

    text: {
      format: {
        type: "json_schema",

        name: "assessment_questions",

        strict: true,

        schema: {
          type: "object",

          properties: {
            questions: {
              type: "array",

              items: {
                type: "object",

                properties: {
                  id: {
                    type: "string",
                  },

                  subject: {
                    type: "string",
                  },

                  order: {
                    type: "integer",
                  },

                  type: {
                    type: "string",

                    enum: [
                      "multiple_choice",
                      "true_false",
                      "short_answer",
                      "essay",
                      "fill_in_the_blank",
                    ],
                  },

                  difficulty: {
                    type: "string",

                    enum: ["easy", "medium", "hard"],
                  },

                  content: {
                    type: "string",
                  },

                  options: {
                    type: "array",

                    items: {
                      type: "object",

                      properties: {
                        id: {
                          type: "string",
                        },

                        text: {
                          type: "string",
                        },

                        isCorrect: {
                          type: "boolean",
                        },
                      },

                      required: ["id", "text", "isCorrect"],

                      additionalProperties: false,
                    },
                  },

                  answer: {
                    type: "string",
                  },

                  explanation: {
                    type: "string",
                  },

                  points: {
                    type: "number",
                  },
                  contentType: {
                    type: "string",
                    enum: ["text", "math", "visual"],
                  },
                  contentKind: {
                    type: "string",
                    enum: ["text", "math", "visual"],
                  },
                  math: {
                    type: ["object", "null"],
                    properties: {
                      expression: { type: "string" },
                      solution: { type: "string" },
                      unit: { type: "string" },
                      tolerance: { type: "number" },
                      solutionLayout: {
                        type: "string",
                        enum: [
                          "top_to_bottom",
                          "horizontal",
                        ],
                      },
                      verified: { type: "boolean" },
                      verification: {
                        type: ["object", "null"],
                        properties: {
                          independentlySolved: { type: "boolean" },
                          expected: { type: ["number", "null"] },
                          declared: { type: ["number", "null"] },
                          unit: { type: "string" },
                        },
                        required: [
                          "independentlySolved",
                          "expected",
                          "declared",
                          "unit",
                        ],
                        additionalProperties: false,
                      },
                    },
                    required: [
                      "expression",
                      "solution",
                      "unit",
                      "tolerance",
                      "solutionLayout",
                      "verified",
                      "verification",
                    ],
                    additionalProperties: false,
                  },
                  assets: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        type: { type: "string" },
                        source: {
                          type: "string",
                          enum: ["generated", "selected", "uploaded", "url"],
                        },
                        url: { type: "string" },
                        prompt: { type: "string" },
                        altText: { type: "string" },
                        validation: {
                          type: ["object", "null"],
                          properties: {
                            valid: { type: "boolean" },
                            reason: { type: "string" },
                          },
                          required: ["valid", "reason"],
                          additionalProperties: false,
                        },
                      },
                      required: [
                        "id",
                        "type",
                        "source",
                        "url",
                        "prompt",
                        "altText",
                        "validation",
                      ],
                      additionalProperties: false,
                    },
                  },
                },

                required: [
                  "id",
                  "subject",
                  "order",
                  "type",
                  "difficulty",
                  "content",
                  "options",
                  "answer",
                  "explanation",
                  "points",
                  "contentType",
                  "contentKind",
                  "math",
                  "assets",
                ],

                additionalProperties: false,
              },
            },
          },

          required: ["questions"],

          additionalProperties: false,
        },
      },
    },
  });

  const rawOutput = response.output_text;

  if (!rawOutput) {
    throw new Error("OpenAI returned an empty response.");
  }

  let parsed;

  try {
    parsed = JSON.parse(rawOutput);
  } catch (error) {
    const parseError = new Error("OpenAI returned invalid JSON.");

    parseError.statusCode = 502;

    throw parseError;
  }

  const result = generatedQuestionsSchema.safeParse(parsed);

  if (!result.success) {
    const validationError = new Error(
      "OpenAI returned questions in an invalid format.",
    );

    validationError.statusCode = 502;

    throw validationError;
  }

  const questions = result.data.questions.map((question) => {
    const options = question.options ?? [];
    const answerText = String(
      question.answer ||
        (question.contentType === "math" ? question.math?.solution : "") ||
        "",
    ).trim();
    const letterIndex = /^[A-Za-z]$/.test(answerText)
      ? answerText.toUpperCase().charCodeAt(0) - 65
      : -1;
    const normalizeOptionText = (value) =>
      String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/^\(?[a-z]\)?[.)\-:]\s*/i, "");
    const matchingOption = options.find(
      (option) =>
        option.id === question.answer ||
        option.text.trim().toLowerCase() === answerText.toLowerCase() ||
        normalizeOptionText(option.text) === normalizeOptionText(answerText),
    );
    const letterOption = options[letterIndex];
    const resolvedOption = matchingOption ?? letterOption;
    const normalizedOptions =
      question.type === "multiple_choice" && resolvedOption
        ? options.map((option) => ({
            ...option,
            isCorrect: option.id === resolvedOption.id,
          }))
        : options;
    const isMath = question.contentType === "math" && question.math?.expression;

    return {
      ...question,
      subject: question.subject || input.subject,
      options: normalizedOptions,
      answer: resolvedOption?.id ?? question.answer,
      contentType:
        question.contentType === "math" && !question.math?.expression
          ? "text"
          : question.contentType || "text",
      contentKind:
        question.contentType === "math" && !question.math?.expression
          ? "text"
          : question.contentKind || question.contentType || "text",
      answer:
        resolvedOption?.id ??
        (question.answer ||
          (question.contentType === "math"
            ? (question.math?.solution ?? "")
            : "")),
      math: question.math
        ? {
            ...question.math,
            solutionLayout: isMath
              ? input.mathSolutionLayout || "top_to_bottom"
              : question.math.solutionLayout || "top_to_bottom",
          }
        : null,
    };
  });

  for (const question of questions) {
    if (question.contentType === "math" && question.math?.expression) {
      const verification = validateMathQuestion(question);
      if (!verification.valid) {
        const error = new Error(
          "Generated math question failed independent verification.",
        );
        error.statusCode = 422;
        error.details = verification;
        throw error;
      }
      question.math = { ...question.math, verified: true, verification };
    }
  }

  return questions;
}

export async function regenerateAssessmentQuestion(question) {
  const isMath =
    question.contentType === "math" || Boolean(question.math?.expression);
  const questions = await generateAssessmentQuestions({
    subject: isMath ? "Math" : "the same subject",
    gradeLevel: "the same grade level",
    topic:
      typeof question.content === "string"
        ? question.content
        : "the same topic",
    questionCount: 1,
    questionTypes: [question.type],
    difficulty: question.difficulty || "medium",
    language: "the same language",
    contentMode: isMath ? "math" : "text",
    mathSolutionLayout: question.math?.solutionLayout || "top_to_bottom",
    instructions: `Create a fresh replacement for this question. Keep the same educational intent but do not repeat its wording. Existing question: ${JSON.stringify(question.content)}.`,
  });

  return {
    ...questions[0],
    id: question.id,
    order: question.order,
    points: question.points,
  };
}
