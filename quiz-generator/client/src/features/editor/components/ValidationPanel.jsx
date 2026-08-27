import { useDispatch, useSelector } from "react-redux";

import { validate } from "../editorSlice";

export default function ValidationPanel() {
  const dispatch = useDispatch();

  const questions = useSelector((state) => state.editor.questions);

  const validation = useSelector((state) => state.editor.validation);

  function handleValidate() {
    dispatch(validate());
  }

  return (
    <div className="border-b border-slate-200 bg-white px-5 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Assessment Check
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Make sure all questions are ready.
          </p>
        </div>

        <button
          type="button"
          onClick={handleValidate}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Check Assessment
        </button>
      </div>

      {validation.questions.length > 0 && (
        <div className="mt-4 space-y-2">
          {validation.questions.map((result) => {
            const hasErrors = result.errors.length > 0;

            return (
              <div
                key={result.id}
                className="flex items-start gap-3 rounded-lg bg-slate-50 p-3"
              >
                <span
                  className={[
                    "mt-0.5 text-sm font-semibold",
                    hasErrors ? "text-amber-600" : "text-green-600",
                  ].join(" ")}
                >
                  {hasErrors ? "!" : "✓"}
                </span>

                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Question {result.order}
                  </p>

                  {hasErrors ? (
                    <ul className="mt-1 space-y-0.5">
                      {result.errors.map((error) => (
                        <li key={error} className="text-xs text-slate-500">
                          {error}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">Ready</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {validation.questions.length > 0 && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          {validation.valid ? (
            <p className="text-sm font-semibold text-green-600">
              ✓ Assessment is ready
            </p>
          ) : (
            <p className="text-sm font-semibold text-amber-600">
              Some questions need attention
            </p>
          )}
        </div>
      )}
    </div>
  );
}
