import { useDispatch, useSelector } from "react-redux";

import { selectQuestion } from "../editorSlice";

export default function QuestionListItem({ question }) {
  const dispatch = useDispatch();

  const selectedQuestionId = useSelector(
    (state) => state.editor.selectedQuestionId,
  );

  const isSelected = selectedQuestionId === question.id;

  return (
    <button
      type="button"
      onClick={() => dispatch(selectQuestion(question.id))}
      className={[
        "flex w-full items-start gap-3 rounded-lg p-3 text-left transition",
        isSelected ? "bg-slate-900 text-white" : "hover:bg-slate-100",
      ].join(" ")}
    >
      <span
        className={[
          "mt-0.5 text-xs font-semibold",
          isSelected ? "text-slate-300" : "text-slate-400",
        ].join(" ")}
      >
        {question.order}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={[
            "block truncate text-sm font-medium",
            isSelected ? "text-white" : "text-slate-700",
          ].join(" ")}
        >
          {question.content?.content?.[0]?.content?.[0]?.text ||
            "Untitled question"}
        </span>

        <span
          className={[
            "mt-1 block text-xs capitalize",
            isSelected ? "text-slate-300" : "text-slate-400",
          ].join(" ")}
        >
          {question.content.type.replaceAll("_", " ")}
        </span>
      </span>

      <span
        className={[
          "cursor-grab text-slate-400",
          isSelected ? "text-slate-500" : "",
        ].join(" ")}
      >
        ⋮⋮
      </span>
    </button>
  );
}
