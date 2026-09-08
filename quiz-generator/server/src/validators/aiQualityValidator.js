function getQuestionText(question) {
  return String(question.content ?? "").trim();
}

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function checkQuestion(question, requestedDifficulty, allQuestions) {
  const questionText = getQuestionText(question);
  const options = question.options ?? [];
  const correctOptions = options.filter(
    (option) => option.isCorrect ?? option.correct,
  );
  const answer = String(
    question.answer || (question.contentType === "math" ? question.math?.solution : "") || "",
  ).trim();
  const normalizedQuestion = normalizeText(questionText);

  const understandable = question.contentType === "math"
    ? String(question.math?.expression ?? questionText).trim().length >= 1
    : questionText.length >= 10;
  const correctAnswerExists =
    question.type === "multiple_choice"
      ? correctOptions.length === 1 &&
        correctOptions[0].id === answer
      : Boolean(answer);
  const exactlyOneCorrectAnswer =
    question.type === "multiple_choice" ? correctOptions.length === 1 : true;
  const minimumOptionLength = question.contentType === "math" ? 1 : 2;
  const distractorsArePlausible =
    question.type !== "multiple_choice" ||
    (options.length >= 2 &&
      options.every((option) => normalizeText(option.text).length >= minimumOptionLength) &&
      new Set(options.map((option) => normalizeText(option.text))).size ===
        options.length);
  const difficultyMatches = question.difficulty === requestedDifficulty;
  const duplicateQuestion = allQuestions.some(
    (candidate) =>
      candidate !== question &&
      normalizeText(candidate.content) === normalizedQuestion,
  );
  const explanationProvided = String(question.explanation ?? "").trim().length >= 10;

  return {
    understandable,
    correctAnswerExists,
    exactlyOneCorrectAnswer,
    distractorsArePlausible,
    difficultyMatches,
    noDuplicateQuestions: !duplicateQuestion,
    explanationProvided,
  };
}

export function validateGeneratedQuestions(questions, requestedDifficulty) {
  const checks = questions.map((question) => ({
    questionId: question.id,
    ...checkQuestion(question, requestedDifficulty, questions),
  }));

  return {
    valid: checks.every((check) =>
      Object.entries(check)
        .filter(([key]) => key !== "questionId")
        .every(([, passed]) => passed),
    ),
    checks,
  };
}
