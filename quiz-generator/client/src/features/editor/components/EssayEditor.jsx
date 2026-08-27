import { useDispatch } from "react-redux";

import { updateQuestion } from "../editorSlice";

export default function EssayEditor({ question }) {
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
          Model Answer / Rubric
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          Add guidance for evaluating the student's response.
        </p>
      </div>

      <textarea
        value={question.answer || ""}
        onChange={handleAnswerChange}
        rows={6}
        placeholder="Enter a model answer or grading guidance..."
        className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>
  );
}
