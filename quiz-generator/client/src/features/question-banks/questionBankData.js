export const questionBankQuestions = [
  {
    id: "bank-photosynthesis-light-reactions",
    title: "Photosynthesis",
    text: "In which part of the chloroplast do the light-dependent reactions primarily take place?",
    type: "multiple_choice",
    subject: "Biology",
    topic: "Photosynthesis",
    grade: "Grade 8",
    difficulty: "Medium",
    points: 2,
    tags: ["plants", "energy"],
    createdBy: "Ava Morgan",
    source: "My questions",
    options: ["Thylakoid membranes", "Stroma", "Nucleus", "Cell wall"],
    answer: "Thylakoid membranes",
  },
  {
    id: "bank-photosystem-two",
    title: "Light-dependent reactions",
    text: "Photosystem II uses light energy to split water molecules.",
    type: "true_false",
    subject: "Biology",
    topic: "Photosynthesis",
    grade: "Grade 8",
    difficulty: "Medium",
    points: 2,
    tags: ["plants", "photosystems"],
    createdBy: "Ava Morgan",
    source: "My questions",
    answer: true,
  },
  {
    id: "bank-calvin-cycle",
    title: "Calvin Cycle",
    text: "Which molecule is produced during the Calvin Cycle?",
    type: "multiple_choice",
    subject: "Biology",
    topic: "Photosynthesis",
    grade: "Grade 8",
    difficulty: "Hard",
    points: 2,
    tags: ["plants", "carbon fixation"],
    createdBy: "Ava Morgan",
    source: "My questions",
    options: ["Glucose", "Oxygen", "Water", "Chlorophyll"],
    answer: "Glucose",
  },
];

export const questionTypeLabels = {
  multiple_choice: "Multiple Choice",
  true_false: "True / False",
  short_answer: "Short Answer",
  essay: "Essay",
};

export function bankQuestionToEditorQuestion(question) {
  const id = `question-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    id,
    type: question.type,
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: question.text }],
        },
      ],
    },
    options: question.options?.map((text, index) => ({
      id: `${id}-option-${index + 1}`,
      text,
      correct: text === question.answer,
    })),
    answer: question.answer,
    points: question.points,
    difficulty: question.difficulty.toLowerCase(),
    subject: question.subject,
    topic: question.topic,
    sourceQuestionId: question.id,
  };
}
