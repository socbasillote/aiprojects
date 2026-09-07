export default function QuestionMath({ question, paperMode = false }) {
  if (question?.contentType !== "math" || !question.math?.expression) {
    return null;
  }

  return (
    <div
      className={`my-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700 ${paperMode ? "border border-slate-200" : ""}`}
      data-question-math
      data-solution-layout={question.math.solutionLayout ?? "step_by_step"}
    >
      <div className="font-mono">{question.math.expression}</div>
      {question.math.unit && (
        <span className="ml-2 text-slate-500">({question.math.unit})</span>
      )}
      {paperMode && question.math.solutionLayout === "top_to_bottom" && (
        <div className="mt-4">
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="border-b border-slate-300" />
            ))}
          </div>
        </div>
      )}
      {paperMode && question.math.solutionLayout !== "top_to_bottom" && (
        <div className="mt-4">
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="border-b border-slate-300" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
