export function validateQuestion(question) {
  const errors = [];

  if (!question.content) {
    errors.push("Question text is missing.");
  }

  if (question.type === "multiple_choice") {
    if (!question.options || question.options.length < 2) {
      errors.push("Multiple choice questions need at least 2 options.");
    }

    const hasEmptyOption = question.options?.some(
      (option) => !option.text?.trim(),
    );

    if (hasEmptyOption) {
      errors.push("One or more options are empty.");
    }

    const correctOptions =
      question.options?.filter((option) => option.correct) || [];

    if (correctOptions.length !== 1) {
      errors.push("Select exactly one correct answer.");
    }
  }

  if (question.type === "true_false") {
    if (question.answer !== true && question.answer !== false) {
      errors.push("Select True or False as the correct answer.");
    }
  }

  if (
    question.type === "short_answer" ||
    question.type === "fill_in_the_blank"
  ) {
    if (!question.answer?.trim()) {
      errors.push("Expected answer is missing.");
    }
  }

  if (question.type === "essay") {
    if (!question.answer?.trim()) {
      errors.push("Model answer or grading guidance is missing.");
    }
  }

  if (typeof question.points !== "number" || question.points <= 0) {
    errors.push("Points must be greater than zero.");
  }

  return errors;
}

export function validateAssessment(questions) {
  const questionResults = questions.map((question) => ({
    id: question.id,
    order: question.order,
    errors: validateQuestion(question),
  }));

  const errors = questionResults.filter((result) => result.errors.length > 0);

  return {
    valid: errors.length === 0,
    questions: questionResults,
    errors,
  };
}
