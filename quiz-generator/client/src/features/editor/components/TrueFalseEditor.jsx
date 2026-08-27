import { useDispatch } from "react-redux";

import { updateQuestion } from "../editorSlice";

export default function TrueFalseEditor({ question }) {
  const dispatch = useDispatch();

  function handleAnswerChange(value) {
    dispatch(
      updateQuestion({
        id: question.id,
        changes: {
          answer: value,
        },
      }),
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Correct Answer</h3>

        <p className="mt-1 text-xs text-slate-400">
          Select the correct response.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((value) => {
          const selected = question.answer === value;

          return (
            <button
              key={String(value)}
              type="button"
              onClick={() => handleAnswerChange(value)}
              className={[
                "rounded-lg border px-4 py-4 text-sm font-medium transition",
                selected
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50",
              ].join(" ")}
            >
              {value ? "True" : "False"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
