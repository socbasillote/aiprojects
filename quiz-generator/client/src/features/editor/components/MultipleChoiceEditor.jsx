import { useDispatch } from "react-redux";

import {
  updateOption,
  setCorrectOption,
  addOption,
  deleteOption,
} from "../editorSlice";

export default function MultipleChoiceEditor({ question }) {
  const dispatch = useDispatch();

  function handleOptionChange(optionId, text) {
    dispatch(
      updateOption({
        questionId: question.id,
        optionId,
        changes: { text },
      }),
    );
  }

  function handleCorrectChange(optionId) {
    dispatch(
      setCorrectOption({
        questionId: question.id,
        optionId,
      }),
    );
  }

  function handleAddOption() {
    const optionId = `${question.id}-option-${Date.now()}`;

    dispatch(
      addOption({
        questionId: question.id,
        option: {
          id: optionId,
          text: "",
          correct: false,
        },
      }),
    );
  }

  function handleDeleteOption(optionId) {
    if (question.options.length <= 2) {
      return;
    }

    dispatch(
      deleteOption({
        questionId: question.id,
        optionId,
      }),
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Answer Choices</h3>

        <span className="text-xs text-slate-400">
          Select the correct answer
        </span>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <div
            key={option.id}
            className={[
              "flex items-center gap-3 rounded-lg border p-3 transition",
              option.correct
                ? "border-slate-400 bg-slate-50"
                : "border-slate-200",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => handleCorrectChange(option.id)}
              aria-label={`Mark option ${String.fromCharCode(
                65 + index,
              )} as correct`}
              className={[
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition",
                option.correct ? "border-slate-900" : "border-slate-300",
              ].join(" ")}
            >
              {option.correct && (
                <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
              )}
            </button>

            <span className="w-5 text-sm font-semibold text-slate-400">
              {String.fromCharCode(65 + index)}
            </span>

            <input
              type="text"
              value={option.text}
              onChange={(event) =>
                handleOptionChange(option.id, event.target.value)
              }
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />

            <button
              type="button"
              onClick={() => handleDeleteOption(option.id)}
              disabled={question.options.length <= 2}
              className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-slate-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddOption}
        className="mt-3 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-500 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700"
      >
        + Add Option
      </button>
    </div>
  );
}
