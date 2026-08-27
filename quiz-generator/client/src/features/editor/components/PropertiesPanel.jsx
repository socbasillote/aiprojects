import { useDispatch, useSelector } from "react-redux";

import { deleteQuestion, updateQuestion } from "../editorSlice";

export default function PropertiesPanel() {
  const dispatch = useDispatch();

  const question = useSelector((state) =>
    state.editor.questions.find(
      (item) => item.id === state.editor.selectedQuestionId,
    ),
  );

  if (!question) {
    return (
      <aside className="w-72 shrink-0 border-l border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-400">
          Select a question to edit its properties.
        </p>
      </aside>
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
      const firstOptionId = `${question.id}-option-1`;

      changes.options = [
        {
          id: firstOptionId,
          text: "Option A",
          correct: true,
        },
        {
          id: `${question.id}-option-2`,
          text: "Option B",
          correct: false,
        },
      ];

      changes.answer = firstOptionId;
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

  return (
    <aside className="w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-5">
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-900">Properties</h2>

        <p className="mt-1 text-xs text-slate-400">Configure this question.</p>
      </div>

      <div className="space-y-5">
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
            onClick={() => dispatch(deleteQuestion(question.id))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete Question
          </button>
        </div>
      </div>
    </aside>
  );
}
