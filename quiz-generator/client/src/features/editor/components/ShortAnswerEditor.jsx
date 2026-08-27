import { useDispatch } from "react-redux";

import { updateQuestion } from "../editorSlice";

export default function ShortAnswerEditor({ question }) {
  const dispatch = useDispatch();

  function handleAnswerChange(event) {
    dispatch(
      updateQuestion({
        id: question.id,
        changes: {
          answer: event.target.value,
        },
      }),
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Expected Answer
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          Provide the answer students are expected to give.
        </p>
      </div>

      <textarea
        value={question.answer || ""}
        onChange={handleAnswerChange}
        rows={3}
        placeholder="Enter the expected answer..."
        className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>
  );
}
