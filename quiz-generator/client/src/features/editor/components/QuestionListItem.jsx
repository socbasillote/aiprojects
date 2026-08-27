import { useDispatch, useSelector } from "react-redux";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { selectQuestion } from "../editorSlice";

export default function QuestionListItem({ question }) {
  const dispatch = useDispatch();

  const selectedQuestionId = useSelector(
    (state) => state.editor.selectedQuestionId,
  );

  const isSelected = selectedQuestionId === question.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "flex items-start gap-2 rounded-lg transition",
        isDragging ? "relative z-10 opacity-60" : "",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => dispatch(selectQuestion(question.id))}
        className={[
          "flex min-w-0 flex-1 items-start gap-3 rounded-lg p-3 text-left transition",
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
            {question.type.replaceAll("_", " ")}
          </span>
        </span>
      </button>

      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-3 cursor-grab rounded-md px-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
        aria-label={`Drag question ${question.order}`}
      >
        ⋮⋮
      </button>
    </div>
  );
}
