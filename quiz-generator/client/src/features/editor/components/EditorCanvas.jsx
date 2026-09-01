import { useSelector, useDispatch } from "react-redux";

import RichTextEditor from "./RichTextEditor";

import { updateQuestion } from "../editorSlice";

import MultipleChoiceEditor from "./MultipleChoiceEditor";
import TrueFalseEditor from "./TrueFalseEditor";
import ShortAnswerEditor from "./ShortAnswerEditor";
import EssayEditor from "./EssayEditor";
import FillBlankEditor from "./FillBlankEditor";

export default function EditorCanvas() {
  const dispatch = useDispatch();

  const question = useSelector((state) =>
    state.editor.questions.find(
      (item) => item.id === state.editor.selectedQuestionId,
    ),
  );

  if (!question) {
    return (
      <section className="flex-1 overflow-y-auto bg-slate-100 p-8">
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-slate-400">Select a question.</p>
        </div>
      </section>
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
            <TrueFalseEditor question={question} />
          )}

          {question.type === "short_answer" && (
            <ShortAnswerEditor question={question} />
          )}

          {question.type === "essay" && <EssayEditor question={question} />}

          {question.type === "fill_in_the_blank" && (
            <FillBlankEditor question={question} />
          )}
        </div>
      </div>
    </section>
  );
}
