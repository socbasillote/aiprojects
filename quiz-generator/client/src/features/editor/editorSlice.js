import { createSlice } from "@reduxjs/toolkit";
import { arrayMove } from "@dnd-kit/sortable";

import { initialQuestions } from "./mockQuestions";
import { validateAssessment } from "./validation";

const createEmptyValidation = () => ({
  valid: false,
  questions: [],
  errors: [],
});

const createSection = ({
  id,
  title = "New Section",
  instructions = "",
  questionIds = [],
} = {}) => ({
  id: id ?? crypto.randomUUID(),
  title,
  instructions,
  questionIds,
});

const initialState = {
  title: "Grade 8 Photosynthesis Quiz",

  questions: initialQuestions,

  selectedQuestionId: initialQuestions[0]?.id ?? null,

  status: "saved",

  validation: createEmptyValidation(),

  sections: [
    createSection({
      id: "section-1",
      title: "Questions",
      questionIds: initialQuestions.map((question) => question.id),
    }),
  ],

  paper: {
    pageSize: "A4",
    orientation: "portrait",
    columns: 1,

    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },

    header: {
      enabled: true,
      schoolName: "",
      subject: "",
      teacher: "",
      date: "",
      duration: "",
    },

    studentInfo: {
      enabled: true,
      name: true,
      gradeSection: true,
      date: true,
      score: true,
    },

    instructions: "",

    footer: {
      enabled: true,
      text: "",
      showPageNumber: true,
    },
  },
};

const editorSlice = createSlice({
  name: "editor",

  initialState,

  reducers: {
    // --------------------------------------------------
    // QUESTION SELECTION
    // --------------------------------------------------

    selectQuestion(state, action) {
      state.selectedQuestionId = action.payload;
    },

    // --------------------------------------------------
    // QUESTION
    // --------------------------------------------------

    updateQuestion(state, action) {
      const { id, changes } = action.payload;

      const question = state.questions.find((item) => item.id === id);

      if (!question) {
        return;
      }

      Object.assign(question, changes);

      // Multiple choice is the only type that uses options.
      if (changes.type && changes.type !== "multiple_choice") {
        delete question.options;
      }

      state.status = "unsaved";
      state.validation = createEmptyValidation();
    },

    // --------------------------------------------------
    // OPTIONS
    // --------------------------------------------------

    updateOption(state, action) {
      const { questionId, optionId, changes } = action.payload;

      const question = state.questions.find((item) => item.id === questionId);

      if (!question || !question.options) {
        return;
      }

      const option = question.options.find((item) => item.id === optionId);

      if (!option) {
        return;
      }

      Object.assign(option, changes);

      state.status = "unsaved";
      state.validation = createEmptyValidation();
    },

    setCorrectOption(state, action) {
      const { questionId, optionId } = action.payload;

      const question = state.questions.find((item) => item.id === questionId);

      if (!question || !question.options) {
        return;
      }

      question.options.forEach((option) => {
        option.correct = option.id === optionId;
      });

      question.answer = optionId;

      state.status = "unsaved";
      state.validation = createEmptyValidation();
    },

    addOption(state, action) {
      const { questionId, option } = action.payload;

      const question = state.questions.find((item) => item.id === questionId);

      if (!question || !question.options) {
        return;
      }

      question.options.push(option);

      state.status = "unsaved";
      state.validation = createEmptyValidation();
    },

    deleteOption(state, action) {
      const { questionId, optionId } = action.payload;

      const question = state.questions.find((item) => item.id === questionId);

      if (!question || !question.options) {
        return;
      }

      question.options = question.options.filter(
        (option) => option.id !== optionId,
      );

      if (question.answer === optionId) {
        question.answer = null;

        question.options.forEach((option) => {
          option.correct = false;
        });
      }

      state.status = "unsaved";
      state.validation = createEmptyValidation();
    },

    // --------------------------------------------------
    // ADD QUESTION
    // --------------------------------------------------

    addQuestion(state, action) {
      const question = action.payload;

      if (!question?.id) {
        return;
      }

      /*
       * Always calculate the new order
       * from the current question count.
       */
      question.order = state.questions.length + 1;

      state.questions.push(question);

      /*
       * New questions go into the first section
       * by default.
       */
      const firstSection = state.sections[0];

      if (firstSection) {
        firstSection.questionIds.push(question.id);
      }

      state.selectedQuestionId = question.id;

      state.status = "unsaved";

      state.validation = {
        valid: false,
        questions: [],
        errors: [],
      };
    },

    // --------------------------------------------------
    // DELETE QUESTION
    // --------------------------------------------------

    deleteQuestion(state, action) {
      const questionId = action.payload;

      const index = state.questions.findIndex((item) => item.id === questionId);

      if (index === -1) {
        return;
      }

      state.questions.splice(index, 1);

      /*
       * Remove the question from every section.
       */
      state.sections.forEach((section) => {
        section.questionIds = section.questionIds.filter(
          (id) => id !== questionId,
        );
      });

      /*
       * Recalculate question order.
       */
      state.questions.forEach((question, questionIndex) => {
        question.order = questionIndex + 1;
      });

      /*
       * Select another question.
       */
      const nextQuestion =
        state.questions[index] ?? state.questions[index - 1] ?? null;

      state.selectedQuestionId = nextQuestion?.id ?? null;

      state.status = "unsaved";
      state.validation = createEmptyValidation();
    },

    // --------------------------------------------------
    // REORDER QUESTIONS
    // --------------------------------------------------

    reorderQuestions(state, action) {
      const { oldIndex, newIndex } = action.payload;

      if (
        oldIndex < 0 ||
        newIndex < 0 ||
        oldIndex >= state.questions.length ||
        newIndex >= state.questions.length
      ) {
        return;
      }

      /*
       * Reorder the question array.
       */
      state.questions = arrayMove(state.questions, oldIndex, newIndex);

      /*
       * Recalculate the global order.
       */
      state.questions.forEach((question, index) => {
        question.order = index + 1;
      });

      /*
       * Remember which section owns each question.
       */
      const sectionByQuestionId = new Map();

      state.sections.forEach((section) => {
        section.questionIds.forEach((questionId) => {
          sectionByQuestionId.set(questionId, section.id);
        });
      });

      /*
       * Rebuild each section's questionIds
       * using the newly ordered questions.
       */
      state.sections.forEach((section) => {
        section.questionIds = [];
      });

      state.questions.forEach((question) => {
        const sectionId = sectionByQuestionId.get(question.id);

        if (!sectionId) {
          return;
        }

        const section = state.sections.find((item) => item.id === sectionId);

        if (!section) {
          return;
        }

        section.questionIds.push(question.id);
      });

      state.status = "unsaved";

      state.validation = {
        valid: false,
        questions: [],
        errors: [],
      };
    },

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    validate(state) {
      const result = validateAssessment(state.questions);

      state.validation = result;
    },

    // --------------------------------------------------
    // PAPER SETTINGS
    // --------------------------------------------------

    updatePaperSettings(state, action) {
      const { changes } = action.payload;

      if (!changes) {
        return;
      }

      Object.assign(state.paper, changes);

      state.status = "unsaved";
    },

    updatePaperSection(state, action) {
      const { section, changes } = action.payload;

      if (!state.paper[section] || !changes) {
        return;
      }

      Object.assign(state.paper[section], changes);

      state.status = "unsaved";
    },

    // --------------------------------------------------
    // ASSESSMENT SECTIONS
    // --------------------------------------------------

    addSection(state, action) {
      const payload = action.payload ?? {};

      const section = createSection({
        id: payload.id,
        title: payload.title ?? "New Section",
        instructions: payload.instructions ?? "",
        questionIds: payload.questionIds ?? [],
      });

      state.sections.push(section);

      state.status = "unsaved";
    },

    updateSection(state, action) {
      const { sectionId, changes } = action.payload;

      const section = state.sections.find((item) => item.id === sectionId);

      if (!section || !changes) {
        return;
      }

      /*
       * Do not allow updateSection to
       * accidentally replace questionIds
       * unless explicitly intended.
       */
      Object.assign(section, changes);

      state.status = "unsaved";
    },

    deleteSection(state, action) {
      const { sectionId } = action.payload;

      /*
       * We always keep at least one section.
       */
      if (state.sections.length <= 1) {
        return;
      }

      const sectionIndex = state.sections.findIndex(
        (section) => section.id === sectionId,
      );

      if (sectionIndex === -1) {
        return;
      }

      /*
       * IMPORTANT:
       *
       * Do not silently delete the questions
       * belonging to the section.
       *
       * Move them into another section.
       */
      const section = state.sections[sectionIndex];

      const remainingSections = state.sections.filter(
        (item) => item.id !== sectionId,
      );

      const destinationSection =
        remainingSections[Math.max(0, sectionIndex - 1)];

      destinationSection.questionIds = [
        ...destinationSection.questionIds,
        ...section.questionIds.filter(
          (id) => !destinationSection.questionIds.includes(id),
        ),
      ];

      state.sections = remainingSections;

      state.status = "unsaved";
    },

    // --------------------------------------------------
    // MOVE QUESTION BETWEEN SECTIONS
    // --------------------------------------------------

    moveQuestionToSection(state, action) {
      const { questionId, fromSectionId, toSectionId } = action.payload;

      if (fromSectionId === toSectionId) {
        return;
      }

      const fromSection = state.sections.find(
        (section) => section.id === fromSectionId,
      );

      const toSection = state.sections.find(
        (section) => section.id === toSectionId,
      );

      if (!fromSection || !toSection) {
        return;
      }

      /*
       * Remove from the old section.
       */
      fromSection.questionIds = fromSection.questionIds.filter(
        (id) => id !== questionId,
      );

      /*
       * Add to the destination section.
       */
      if (!toSection.questionIds.includes(questionId)) {
        toSection.questionIds.push(questionId);
      }

      /*
       * Rebuild the global question order
       * according to section order.
       */
      const orderedQuestionIds = state.sections.flatMap(
        (section) => section.questionIds,
      );

      const questionById = new Map(
        state.questions.map((question) => [question.id, question]),
      );

      const reorderedQuestions = orderedQuestionIds
        .map((id) => questionById.get(id))
        .filter(Boolean);

      /*
       * Preserve any questions that aren't
       * currently assigned to a section.
       */
      const assignedIds = new Set(orderedQuestionIds);

      state.questions.forEach((question) => {
        if (!assignedIds.has(question.id)) {
          reorderedQuestions.push(question);
        }
      });

      state.questions = reorderedQuestions;

      /*
       * Recalculate printed numbering.
       */
      state.questions.forEach((question, index) => {
        question.order = index + 1;
      });

      state.status = "unsaved";

      state.validation = {
        valid: false,
        questions: [],
        errors: [],
      };
    },

    reorderQuestionsInSection(state, action) {
      const { sectionId, oldIndex, newIndex } = action.payload;

      const section = state.sections.find((item) => item.id === sectionId);

      if (!section) {
        return;
      }

      if (
        oldIndex < 0 ||
        newIndex < 0 ||
        oldIndex >= section.questionIds.length ||
        newIndex >= section.questionIds.length
      ) {
        return;
      }

      section.questionIds = arrayMove(section.questionIds, oldIndex, newIndex);

      state.status = "unsaved";
      state.validation = createEmptyValidation();
    },
  },
});

export const {
  selectQuestion,

  updateQuestion,

  updateOption,
  setCorrectOption,
  addOption,
  deleteOption,

  addQuestion,
  deleteQuestion,
  reorderQuestions,

  validate,

  updatePaperSettings,
  updatePaperSection,

  addSection,
  updateSection,
  deleteSection,
  moveQuestionToSection,
  reorderQuestionsInSection,
} = editorSlice.actions;

export default editorSlice.reducer;
