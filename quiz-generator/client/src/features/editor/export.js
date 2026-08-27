export function buildAssessmentExport({ title, description, questions }) {
  return {
    version: 1,

    title,
    description,

    questions: questions.map((question, index) => {
      const baseQuestion = {
        id: question.id,
        order: index + 1,
        type: question.type,
        content: question.content,
        points: question.points,
        difficulty: question.difficulty,
      };

      if (question.type === "multiple_choice") {
        baseQuestion.options = question.options.map((option) => ({
          id: option.id,
          text: option.text,
          correct: option.correct,
        }));
      }

      if (
        question.type === "true_false" ||
        question.type === "short_answer" ||
        question.type === "fill_in_the_blank" ||
        question.type === "essay"
      ) {
        baseQuestion.answer = question.answer;
      }

      return baseQuestion;
    }),
  };
}

export function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);

  const blob = new Blob([json], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);
}
