import { useSelector, useDispatch } from "react-redux";

import RichTextEditor from "./RichTextEditor";

import { updateQuestion } from "../editorSlice";
import MultipleChoiceEditor from "./MultipleChoiceEditor";

function TrueFalseQuestion({ question }) {
  return (
    <div className="mt-6 flex gap-3">
      {["True", "False"].map((value) => (
        <div
          key={value}
          className="rounded-lg border border-slate-200 px-6 py-3 text-sm text-slate-700"
        >
          {value}
        </div>
      ))}
    </div>
  );
}

function ShortAnswerQuestion() {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-6">
      <p className="text-sm text-slate-400">Student response area</p>
    </div>
  );
}

function EssayQuestion() {
  return (
    <div className="mt-6 space-y-3">
      {[1, 2, 3, 4].map((line) => (
        <div key={line} className="border-b border-slate-200" />
      ))}
    </div>
  );
}

export default function EditorCanvas() {
  const dispatch = useDispatch();

  const question = useSelector((state) =>
    state.editor.questions.find(
      (item) => item.id === state.editor.selectedQuestionId,
    ),
  );

  if (!question) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-slate-400">Select a question.</p>
      </div>
    );
  }

  return (
    <section className="flex-1 overflow-y-auto bg-slate-100 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Question {question.order}
            </span>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-500">
              {question.difficulty}
            </span>
          </div>

          <div className="mt-5">
            <RichTextEditor
              content={question.content}
              onChange={(content) =>
                dispatch(
                  updateQuestion({
                    id: question.id,
                    changes: { content },
                  }),
                )
              }
            />
          </div>

          {question.type === "multiple_choice" && (
            <MultipleChoiceEditor question={question} />
          )}

          {question.type === "true_false" && (
            <TrueFalseQuestion question={question} />
          )}

          {question.type === "short_answer" && <ShortAnswerQuestion />}

          {question.type === "essay" && <EssayQuestion />}
        </div>
      </div>
    </section>
  );
}
