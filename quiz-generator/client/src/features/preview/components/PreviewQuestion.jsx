import { EditorContent, useEditor } from "@tiptap/react";

import { createQuestionEditorExtensions } from "../../editor/tiptapConfig";

function QuestionContent({ content }) {
  const editor = useEditor({
    extensions: createQuestionEditorExtensions(),
    content,
    editable: false,
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} className="preview-content" />;
}

export default function PreviewQuestion({ question, answer, onAnswer }) {
  /*   const [answer, setAnswer] = useState(
    question.type === "true_false" ? null : "",
  ); */

  function handleAnswerChange(value) {
    onAnswer(value);
  }

  return (
    <div>
      <QuestionContent content={question.content} />

      {question.type === "multiple_choice" && (
        <div className="mt-8 space-y-3">
          {question.options.map((option, index) => {
            const selected = answer === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleAnswerChange(option.id)}
                className={[
                  "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition",
                  selected
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                    selected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 text-slate-500",
                  ].join(" ")}
                >
                  {String.fromCharCode(65 + index)}
                </span>

                <span className="text-sm text-slate-700">{option.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {question.type === "true_false" && (
        <div className="mt-8 grid grid-cols-2 gap-4">
          {[true, false].map((value) => {
            const selected = answer === value;

            return (
              <button
                key={String(value)}
                type="button"
                onClick={() => handleAnswerChange(value)}
                className={[
                  "rounded-xl border px-6 py-5 text-sm font-semibold transition",
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
      )}

      {question.type === "short_answer" && (
        <div className="mt-8">
          <input
            type="text"
            value={answer || ""}
            onChange={(event) => handleAnswerChange(event.target.value)}
            placeholder="Type your answer..."
            className="w-full rounded-xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-400"
          />
        </div>
      )}

      {question.type === "fill_in_the_blank" && (
        <div className="mt-8">
          <input
            type="text"
            value={answer || ""}
            onChange={(event) => handleAnswerChange(event.target.value)}
            placeholder="Type your answer..."
            className="w-full rounded-xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-400"
          />
        </div>
      )}

      {question.type === "essay" && (
        <div className="mt-8">
          <textarea
            value={answer || ""}
            onChange={(event) => handleAnswerChange(event.target.value)}
            rows={10}
            placeholder="Write your response..."
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-400"
          />
        </div>
      )}
    </div>
  );
}
