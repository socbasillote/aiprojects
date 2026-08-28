export function buildPaperLayout({ title, questions, sections, paper }) {
  const blocks = [];

  let questionNumber = 1;

  /*
   * Build a lookup so we can quickly find
   * a question from its ID.
   */
  const questionById = new Map(
    questions.map((question) => [question.id, question]),
  );

  /*
   * Track questions that have already
   * been included in a section.
   */
  const assignedQuestionIds = new Set();

  for (const section of sections) {
    /*
     * Add section heading/instructions.
     */
    if (section.title?.trim() || section.instructions?.trim()) {
      blocks.push({
        id: section.id,
        type: "section",

        title: section.title ?? "",

        instructions: section.instructions ?? "",

        keepWithNext: true,
      });
    }

    /*
     * Add questions in the exact order
     * stored by the section.
     */
    for (const questionId of section.questionIds) {
      const question = questionById.get(questionId);

      if (!question) {
        continue;
      }

      assignedQuestionIds.add(question.id);

      blocks.push({
        id: question.id,
        type: "question",

        /*
         * IMPORTANT:
         * This is the number that will appear
         * on the actual paper.
         *
         * It is based on paper position,
         * NOT question.order.
         */
        number: questionNumber,

        question,
      });

      questionNumber += 1;
    }
  }

  /*
   * Include questions that aren't assigned
   * to a section.
   */
  for (const question of questions) {
    if (assignedQuestionIds.has(question.id)) {
      continue;
    }

    blocks.push({
      id: question.id,
      type: "question",
      number: questionNumber,
      question,
    });

    questionNumber += 1;
  }

  return {
    title,

    paper: {
      pageSize: paper.pageSize,
      orientation: paper.orientation,
      columns: paper.columns,

      margins: {
        ...paper.margins,
      },
    },

    chrome: {
      header: {
        ...paper.header,
      },

      studentInfo: {
        ...paper.studentInfo,
      },

      instructions: paper.instructions ?? "",

      footer: {
        ...paper.footer,
      },
    },

    blocks,
  };
}
