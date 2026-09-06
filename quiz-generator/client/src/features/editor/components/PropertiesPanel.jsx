import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { normalizeAssessment, regenerateQuestion } from "../../../api/assessmentApi";
import {
  assignQuestionToSection,
  deleteQuestion,
  updateQuestion,
} from "../editorSlice";

export default function PropertiesPanel({ embedded = false }) {
  const dispatch = useDispatch();
  const { assessmentId } = useParams();
  const [regenerating, setRegenerating] = useState(false);
  const [regenerationError, setRegenerationError] = useState("");

  const question = useSelector((state) =>
    state.editor.questions.find(
      (item) => item.id === state.editor.selectedQuestionId,
    ),
  );

  const sections = useSelector((state) => state.editor.sections);

  const questionSection = sections.find((section) =>
    section.questionIds.includes(question?.id),
  );

  if (!question) {
    return (
      <div
        className={
          embedded
            ? "p-4"
            : "w-72 shrink-0 border-l border-slate-200 bg-white p-5"
        }
      >
        <p className="text-sm text-slate-400">
          Select a question to edit its properties.
        </p>
      </div>
    );
  }

  function update(changes) {
    dispatch(
      updateQuestion({
        id: question.id,
        changes,
      }),
    );
  }

  function handleTypeChange(type) {
    const changes = {
      type,
    };

    if (type === "multiple_choice") {
      const options = question.options?.length
        ? question.options
        : [
            {
              id: `${question.id}-option-1`,
              text: "Option A",
              correct: true,
            },
            {
              id: `${question.id}-option-2`,
              text: "Option B",
              correct: false,
            },
          ];
      const selectedOption = options.find(
        (option) => option.id === question.answer || option.correct,
      );

      changes.options = options;
      changes.answer = selectedOption?.id ?? options[0].id;
    }

    if (type === "true_false") {
      changes.answer = true;
    }

    if (
      type === "short_answer" ||
      type === "essay" ||
      type === "fill_in_the_blank"
    ) {
      changes.answer = "";
    }

    update(changes);
  }

  async function handleRegenerate() {
    if (!assessmentId || regenerating) {
      return;
    }

    try {
      setRegenerating(true);
      setRegenerationError("");

      const replacement = await regenerateQuestion(
        assessmentId,
        question.id,
        question,
      );
      const normalizedQuestion = normalizeAssessment({
        questions: [replacement],
      }).questions[0];

      dispatch(
        updateQuestion({
          id: question.id,
          changes: normalizedQuestion,
        }),
      );
    } catch (error) {
      setRegenerationError(error.message || "Unable to regenerate question.");
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div
      className={
        embedded
          ? "p-4"
          : "w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-5"
      }
    >
      <div className="space-y-5">
        <div>
          <label
            htmlFor="question-section"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Section (optional)
          </label>

          <select
            id="question-section"
            value={questionSection?.id ?? ""}
            onChange={(event) =>
              dispatch(
                assignQuestionToSection({
                  questionId: question.id,
                  sectionId: event.target.value || null,
                }),
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">No section</option>
            {sections.map((section, index) => (
              <option key={section.id} value={section.id}>
                Section {index + 1}: {section.title || "Untitled Section"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="question-type"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Type
          </label>

          <select
            id="question-type"
            value={question.type}
            onChange={(event) => handleTypeChange(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="multiple_choice">Multiple Choice</option>

            <option value="true_false">True / False</option>

            <option value="short_answer">Short Answer</option>

            <option value="essay">Essay</option>

            <option value="fill_in_the_blank">Fill in the Blank</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="difficulty"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Difficulty
          </label>

          <select
            id="difficulty"
            value={question.difficulty}
            onChange={(event) =>
              update({
                difficulty: event.target.value,
              })
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="points"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Points
          </label>

          <input
            id="points"
            type="number"
            min="0"
            value={question.points}
            onChange={(event) =>
              update({
                points: Number(event.target.value),
              })
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Question status</p>

          <p className="mt-1 text-sm font-medium text-slate-900">Ready</p>
        </div>

        <div className="border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating || !assessmentId}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {regenerating ? "Regenerating..." : "Regenerate Question"}
          </button>

          {regenerationError && (
            <p className="mt-2 text-xs text-red-600">{regenerationError}</p>
          )}
        </div>

        <div className="border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={() => dispatch(deleteQuestion(question.id))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete Question
          </button>
        </div>
      </div>
    </div>
  );
}
