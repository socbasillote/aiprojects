import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import PreviewHeader from "../features/preview/components/PreviewHeader";
import PreviewQuestion from "../features/preview/components/PreviewQuestion";

export default function AssessmentPreviewPage() {
  const title = useSelector((state) => state.editor.title);

  const questions = useSelector((state) => state.editor.questions);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState({});

  const question = questions[currentIndex];

  if (!question) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">No questions available.</p>
      </div>
    );
  }

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  function handleAnswer(value) {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: value,
    }));
  }

  function handleNext() {
    if (!isLast) {
      setCurrentIndex((index) => index + 1);
    }
  }

  function handlePrevious() {
    if (!isFirst) {
      setCurrentIndex((index) => index - 1);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <PreviewHeader
        title={title}
        current={currentIndex + 1}
        total={questions.length}
      />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="mb-8 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Question {currentIndex + 1}
            </span>

            <span className="text-xs font-medium text-slate-400">
              {question.points} {question.points === 1 ? "point" : "points"}
            </span>
          </div>

          <PreviewQuestion
            key={question.id}
            question={question}
            answer={answers[question.id]}
            onAnswer={handleAnswer}
          />

          <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={isFirst}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Previous
            </button>

            {!isLast ? (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Next →
              </button>
            ) : (
              <Link
                to="/dashboard"
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Finish Preview
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {questions.map((item, index) => {
            const answered = answers[item.id] !== undefined;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={[
                  "h-2.5 w-2.5 rounded-full transition",
                  index === currentIndex
                    ? "bg-slate-900"
                    : answered
                      ? "bg-slate-400"
                      : "bg-slate-200",
                ].join(" ")}
                aria-label={`Go to question ${index + 1}`}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}
