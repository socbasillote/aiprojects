import { createSlice } from "@reduxjs/toolkit";

import { arrayMove } from "@dnd-kit/sortable";

import { initialQuestions } from "./mockQuestions";

import { validateAssessment } from "./validation";

const initialState = {
  title: "Grade 8 Photosynthesis Quiz",
  questions: initialQuestions,
  selectedQuestionId: initialQuestions[0].id,
  status: "saved",
  validation: {
    valid: false,
    questions: [],
    errors: [],
  },
};

const editorSlice = createSlice({
  name: "editor",

  initialState,

  reducers: {
    selectQuestion(state, action) {
      state.selectedQuestionId = action.payload;
    },

    updateQuestion(state, action) {
      const { id, changes } = action.payload;

      const question = state.questions.find((item) => item.id === id);

      if (!question) return;

      Object.assign(question, changes);

      if (changes.type && changes.type !== "multiple_choice") {
        delete question.options;
      }

      state.status = "unsaved";
      state.validation = {
        valid: false,
        questions: [],
        errors: [],
      };
    },

    updateOption(state, action) {
      const { questionId, optionId, changes } = action.payload;

      const question = state.questions.find((item) => item.id === questionId);

      if (!question || !question.options) return;

      const option = question.options.find((item) => item.id === optionId);

      if (!option) return;

      Object.assign(option, changes);

      state.status = "unsaved";

      state.validation = {
        valid: false,
        questions: [],
        errors: [],
      };
    },

    setCorrectOption(state, action) {
      const { questionId, optionId } = action.payload;

      const question = state.questions.find((item) => item.id === questionId);

      if (!question || !question.options) return;

      question.options.forEach((option) => {
        option.correct = option.id === optionId;
      });

      question.answer = optionId;

      state.status = "unsaved";

      state.validation = {
        valid: false,
        questions: [],
        errors: [],
      };
    },

    addOption(state, action) {
      const { questionId, option } = action.payload;

      const question = state.questions.find((item) => item.id === questionId);

      if (!question || !question.options) return;

      question.options.push(option);

      state.status = "unsaved";

      state.validation = {
        valid: false,
        questions: [],
        errors: [],
      };
    },

    deleteOption(state, action) {
      const { questionId, optionId } = action.payload;

      const question = state.questions.find((item) => item.id === questionId);

      if (!question || !question.options) return;

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

      state.validation = {
        valid: false,
        questions: [],
        errors: [],
      };
    },

    addQuestion(state, action) {
      state.questions.push(action.payload);

      state.selectedQuestionId = action.payload.id;

      state.status = "unsaved";
      state.validation = {
        valid: false,
        questions: [],
        errors: [],
      };
    },

    deleteQuestion(state, action) {
      const index = state.questions.findIndex(
        (item) => item.id === action.payload,
      );

      if (index === -1) return;

      state.questions.splice(index, 1);

      const nextQuestion = state.questions[index] || state.questions[index - 1];

      state.selectedQuestionId = nextQuestion?.id || null;

      state.status = "unsaved";
      state.validation = {
        valid: false,
        questions: [],
        errors: [],
      };
    },

    reorderQuestions(state, action) {
      const { oldIndex, newIndex } = action.payload;

      state.questions = arrayMove(state.questions, oldIndex, newIndex);

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
    validate(state) {
      const result = validateAssessment(state.questions);

      state.validation = result;
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
  reorderQuestions,
  addQuestion,
  deleteQuestion,
  validate,
} = editorSlice.actions;

export default editorSlice.reducer;
