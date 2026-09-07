const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

function normalizeQuestionContent(content) {
  if (content && typeof content === "object") {
    return content;
  }

  const paragraphs = String(content ?? "")
    .split(/\r?\n/)
    .map((text) => ({
      type: "paragraph",
      content: text ? [{ type: "text", text }] : [],
    }));

  return {
    type: "doc",
    content: paragraphs.length ? paragraphs : [{ type: "paragraph" }],
  };
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      result?.message ||
      result?.error ||
      `Request failed with status ${response.status}.`;

    const error = new Error(message);
    error.status = response.status;
    error.data = result;

    throw error;
  }

  return result?.data ?? result;
}

export function normalizeAssessment(assessment) {
  if (!assessment) {
    return assessment;
  }

  return {
    ...assessment,
    questions: (assessment.questions ?? []).map((question) => ({
      ...question,
      content: normalizeQuestionContent(question.content),
      options: (question.options ?? []).map((option) => ({
        ...option,
        correct: option.correct ?? option.isCorrect ?? false,
      })),
    })),
  };
}

function serializeAssessment(document) {
  return {
    ...document,
    questions: (document.questions ?? []).map((question) => ({
      ...question,
      options: (question.options ?? []).map(({ correct, ...option }) => ({
        ...option,
        isCorrect: correct ?? option.isCorrect ?? false,
      })),
    })),
  };
}

/*
 * --------------------------------------------------
 * CREATE
 * --------------------------------------------------
 */

export async function createAssessment(data = {}) {
  return request("/assessments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/*
 * --------------------------------------------------
 * LIST
 * --------------------------------------------------
 */

export async function listAssessments() {
  return request("/assessments", {
    method: "GET",
  });
}

/*
 * --------------------------------------------------
 * GET
 * --------------------------------------------------
 */

export async function getAssessment(assessmentId) {
  if (!assessmentId) {
    throw new Error("Assessment ID is required.");
  }

  return normalizeAssessment(
    await request(`/assessments/${assessmentId}`, {
      method: "GET",
    }),
  );
}

/*
 * --------------------------------------------------
 * UPDATE
 * --------------------------------------------------
 */

export async function updateAssessment(assessmentId, data) {
  if (!assessmentId) {
    throw new Error("Assessment ID is required.");
  }

  return request(`/assessments/${assessmentId}`, {
    method: "PATCH",
    body: JSON.stringify(serializeAssessment(data)),
  });
}

/*
 * --------------------------------------------------
 * DELETE
 * --------------------------------------------------
 */

export async function deleteAssessment(assessmentId) {
  if (!assessmentId) {
    throw new Error("Assessment ID is required.");
  }

  return request(`/assessments/${assessmentId}`, {
    method: "DELETE",
  });
}

/*
 * --------------------------------------------------
 * GENERATE QUESTIONS
 * --------------------------------------------------
 */

export async function generateQuestions(assessmentId, data = {}) {
  if (!assessmentId) {
    throw new Error("Assessment ID is required.");
  }

  return request(`/assessments/${assessmentId}/generate`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function generateQuestionPreview(assessmentId, data = {}) {
  if (!assessmentId) {
    throw new Error("Assessment ID is required.");
  }

  return request(`/assessments/${assessmentId}/generate-preview`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function regenerateQuestion(assessmentId, questionId, question) {
  if (!assessmentId || !questionId) {
    throw new Error("Assessment ID and question ID are required.");
  }

  return request(
    `/assessments/${assessmentId}/questions/${questionId}/regenerate`,
    {
      method: "POST",
      body: JSON.stringify({ question }),
    },
  );
}
