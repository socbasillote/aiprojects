import { openai } from "../../config/openai.js";

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
}) {
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
                },

                required: [
                  "id",
                  "order",
                  "type",
                  "difficulty",
                  "content",
                  "options",
                  "answer",
                  "explanation",
                  "points",
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

  return result.data.questions;
}

export async function regenerateAssessmentQuestion(question) {
  const questions = await generateAssessmentQuestions({
    subject: "the same subject",
    gradeLevel: "the same grade level",
    topic: typeof question.content === "string" ? question.content : "the same topic",
    questionCount: 1,
    questionTypes: [question.type],
    difficulty: question.difficulty || "medium",
    language: "the same language",
    instructions: `Create a fresh replacement for this question. Keep the same educational intent but do not repeat its wording. Existing question: ${JSON.stringify(question.content)}.`,
  });

  return {
    ...questions[0],
    id: question.id,
    order: question.order,
    points: question.points,
  };
}
