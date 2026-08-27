import { useDispatch, useSelector } from "react-redux";

import QuestionListItem from "./QuestionListItem";
import { addQuestion } from "../editorSlice";

export default function QuestionSidebar() {
  const dispatch = useDispatch();

  const questions = useSelector((state) => state.editor.questions);

  function handleAddQuestion() {
    const id = `question-${Date.now()}`;

    dispatch(
      addQuestion({
        id,
        type: "multiple_choice",
        order: questions.length + 1,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "New question",
                },
              ],
            },
          ],
        },
        options: [
          {
            id: `${id}-option-1`,
            text: "Option A",
            correct: true,
          },
          {
            id: `${id}-option-2`,
            text: "Option B",
            correct: false,
          },
        ],
        answer: `${id}-option-1`,
        points: 1,
        difficulty: "medium",
      }),
    );
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Questions</h2>

            <p className="text-xs text-slate-400">
              {questions.length} questions
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {questions.map((question) => (
          <QuestionListItem key={question.id} question={question} />
        ))}
      </div>

      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={handleAddQuestion}
          className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50"
        >
          + Add Question
        </button>
      </div>
    </aside>
  );
}
