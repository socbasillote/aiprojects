import { useState } from "react";
import { useDispatch } from "react-redux";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import PaperTreeQuestion from "./PaperTreeQuestion";
import { updateSection } from "../../editor/editorSlice";

export default function PaperTreeSection({
  section,
  fallbackTitle,
  questions,
  onOpenAddQuestion,
}) {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: `section-${section.id}`,
      data: {
        type: "section",
        sectionId: section.id,
      },
    });

  const sectionQuestions = section.questionIds
    .map((questionId) =>
      questions.find((question) => question.id === questionId),
    )
    .filter(Boolean);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <section ref={setNodeRef} style={style}>
      <div className="group flex w-full items-center gap-2 rounded hover:bg-slate-100">
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? "Collapse" : "Expand"} section`}
          className="flex h-9 w-7 shrink-0 items-center justify-center text-xs text-slate-400"
        >
          {isExpanded ? "▾" : "▸"}

          <span className="sr-only">{isExpanded ? "Collapse" : "Expand"}</span>
        </button>

        {isEditingTitle ? (
          <input
            autoFocus
            type="text"
            value={section.title ?? ""}
            onChange={(event) =>
              dispatch(
                updateSection({
                  sectionId: section.id,
                  changes: { title: event.target.value },
                }),
              )
            }
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === "Escape") {
                event.currentTarget.blur();
              }
            }}
            placeholder="Untitled Section"
            aria-label="Section title"
            className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingTitle(true)}
            className="min-w-0 flex-1 truncate px-1 py-2 text-left text-sm font-semibold text-slate-800"
          >
            {section.title || fallbackTitle || "Untitled Section"}
          </button>
        )}

        <span className="text-xs text-slate-400">
          {sectionQuestions.length}
        </span>

        <button
          type="button"
          onClick={() => onOpenAddQuestion(section.id)}
          aria-label={`Add question to ${section.title || fallbackTitle || "section"}`}
          className="rounded px-1.5 text-sm font-medium text-slate-400 opacity-0 transition-opacity hover:bg-slate-200 hover:text-slate-700 group-hover:opacity-100"
        >
          +
        </button>

        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag ${section.title || "section"}`}
          className="rounded px-1 text-xs text-slate-400 hover:bg-slate-200 hover:text-slate-600 active:cursor-grabbing"
        >
          ⋮⋮
        </button>
      </div>

      {isExpanded && (
        <div className="ml-3 border-l border-slate-200 pl-2">
          {isEditingInstructions ? (
            <textarea
              autoFocus={isEditingInstructions}
              value={section.instructions ?? ""}
              onChange={(event) =>
                dispatch(
                  updateSection({
                    sectionId: section.id,
                    changes: { instructions: event.target.value },
                  }),
                )
              }
              onBlur={() => setIsEditingInstructions(false)}
              placeholder="Add section instruction"
              aria-label="Section instruction"
              rows={3}
              className="mb-2 w-full resize-y rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-600 outline-none focus:border-sky-400"
            />
          ) : section.instructions?.trim() ? (
            <button
              type="button"
              onClick={() => setIsEditingInstructions(true)}
              className="mb-2 block w-full rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-left text-xs text-amber-900 hover:border-amber-300"
            >
              <span className="font-semibold">Instruction</span>
              <span className="mt-0.5 block whitespace-pre-wrap text-amber-800">
                {section.instructions}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingInstructions(true)}
              className="mb-2 px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              + Add instruction
            </button>
          )}

          {sectionQuestions.map((question) => (
            <PaperTreeQuestion
              key={question.id}
              question={question}
              sectionId={section.id}
            />
          ))}

          {sectionQuestions.length === 0 && (
            <div className="px-2 py-1.5 text-xs text-slate-400">
              No questions
            </div>
          )}
        </div>
      )}
    </section>
  );
}
