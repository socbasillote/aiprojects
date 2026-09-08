function createMultiplicationProblems(seed) {
  let value = Array.from(String(seed), (character) => character.charCodeAt(0)).reduce(
    (total, code) => (total * 31 + code) >>> 0,
    7,
  );

  function nextNumber() {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value;
  }

  return Array.from({ length: 70 }, () => {
    const first = nextNumber() % 10 === 0 ? 10 : nextNumber() % 10;
    const secondRoll = nextNumber() % 12;
    const second = secondRoll < 2 ? secondRoll : 1 + (nextNumber() % 9);

    return { first, second };
  });
}

function MultiplicationGrid({ question }) {
  const problems = createMultiplicationProblems(question.id);

  return (
    <div className="mt-4 grid grid-cols-7 gap-x-2 gap-y-4 border-y border-slate-300 py-3">
      {problems.map(({ first, second }, index) => (
        <div
          key={`${question.id}-multiplication-${index}`}
          className="font-mono text-center text-xs leading-tight text-slate-700"
        >
          <div className="pr-2 text-right">{first}</div>
          <div className="flex items-end justify-center gap-1 border-b border-slate-700 pb-1">
            <span aria-hidden="true">×</span>
            <span>{second}</span>
          </div>
          <div className="mt-2 h-3 border-b border-slate-400" />
        </div>
      ))}
    </div>
  );
}

export default function QuestionMath({
  question,
  paperMode = false,
  layoutOverride,
}) {
  if (question?.contentType !== "math" || !question.math?.expression) {
    return null;
  }

  const solutionLayout =
    ["horizontal", "multiplication_grid"].includes(layoutOverride)
      ? layoutOverride
      : ["horizontal", "multiplication_grid"].includes(
            question.math.solutionLayout,
          )
        ? question.math.solutionLayout
      : "top_to_bottom";

  if (paperMode && solutionLayout === "multiplication_grid") {
    return (
      <div
        className="my-3 text-sm text-slate-700"
        data-question-math
        data-solution-layout={solutionLayout}
      >
        <MultiplicationGrid question={question} />
      </div>
    );
  }

  return (
    <div
      className="my-3 text-sm text-slate-700"
      data-question-math
      data-solution-layout={solutionLayout}
    >
      <div className="font-mono">{question.math.expression}</div>
      {question.math.unit && (
        <span className="ml-2 text-slate-500">({question.math.unit})</span>
      )}
      {paperMode && solutionLayout === "top_to_bottom" && (
        <div className="mt-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="border-b border-slate-300" />
            ))}
          </div>
        </div>
      )}
      {paperMode && solutionLayout === "horizontal" && (
        <div className="mt-4 flex items-end gap-3">
          <span className="text-xs text-slate-500">Answer</span>
          <div className="min-w-0 flex-1 border-b border-slate-300" />
        </div>
      )}
    </div>
  );
}
