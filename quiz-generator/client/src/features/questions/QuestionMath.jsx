export default function QuestionMath({
  question,
  paperMode = false,
  layoutOverride,
}) {
  if (question?.contentType !== "math" || !question.math?.expression) {
    return null;
  }

  const solutionLayout = [
    "top_to_bottom",
    "horizontal",
  ].includes(layoutOverride)
    ? layoutOverride
    : [
          "top_to_bottom",
          "horizontal",
        ].includes(
          question.math.solutionLayout,
        )
      ? question.math.solutionLayout
      : "top_to_bottom";

  const expression = String(question.math.expression).trim();
  const match = expression.match(/^(.*?)\s*([+\-×x*/÷])\s*(.*?)$/);
  const parsed = match
    ? {
        first: match[1].trim(),
        operator:
          match[2] === "x" || match[2] === "*"
            ? "×"
            : match[2] === "/"
              ? "÷"
              : match[2],
        second: match[3].trim(),
      }
    : null;

  const isDivision = parsed?.operator === "÷";
  const isHorizontal =
    paperMode && (solutionLayout === "horizontal" || isDivision);
  const isVertical = paperMode && solutionLayout === "top_to_bottom";

  return (
    <div className="my-4 text-sm text-slate-700" data-question-math data-solution-layout={solutionLayout}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Solve
        </span>
        {question.math.unit && (
          <span className="text-xs text-slate-500">
            Unit: {question.math.unit}
          </span>
        )}
      </div>
      {isHorizontal && parsed ? (
        <div className="flex items-end gap-3 rounded-md border border-dashed border-slate-300 bg-white px-3 py-3 font-mono text-base font-semibold">
          <span>{parsed.first} {parsed.operator} {parsed.second}</span>
          <div className="min-w-0 flex-1 border-b-2 border-slate-400" />
        </div>
      ) : isVertical && parsed ? (
        <div className="mx-auto w-28 font-mono text-right text-base font-semibold">
          <div>{parsed.first}</div>
          <div className="relative border-b-2 border-slate-700 pb-1">
            <span className="absolute -left-5 top-0">{parsed.operator}</span>
            {parsed.second}
          </div>
          <div className="mt-3 border-b-2 border-slate-400 pb-1" />
        </div>
      ) : (
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-base font-semibold tracking-wide">
          {question.math.expression}
        </div>
      )}
      {paperMode && !isHorizontal && !isVertical && (
        <div className="mt-3 flex items-end gap-3 rounded-md border border-dashed border-slate-300 bg-white px-3 py-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Answer
          </span>
          <div className="min-w-0 flex-1 border-b-2 border-slate-400" />
        </div>
      )}
    </div>
  );
}
