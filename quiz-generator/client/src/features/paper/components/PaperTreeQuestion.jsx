import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { addOption, selectQuestion } from "../../editor/editorSlice";

function getQuestionLabel(question) {
  const text = getTextContent(question.content).trim();
  const image = getImageNodes(question.content)[0];

  return (
    text || image?.attrs?.alt || image?.attrs?.caption || "Add question text"
  );
}

function getTextContent(node) {
  if (!node) {
    return "";
  }

  if (node.type === "text") {
    return node.text || "";
  }

  return (node.content || []).map(getTextContent).join(" ");
}

function getImageNodes(node) {
  if (!node) {
    return [];
  }

  if (node.type === "image") {
    return [node];
  }

  return (node.content || []).flatMap(getImageNodes);
}

export default function PaperTreeQuestion({ question, sectionId = null }) {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedQuestionId = useSelector(
    (state) => state.editor.selectedQuestionId,
  );

  const isSelected = selectedQuestionId === question.id;
  const isMultipleChoice = question.type === "multiple_choice";
  const textContent = getTextContent(question.content).trim();
  const images = getImageNodes(question.content);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: question.id,
      data: {
        type: "question",
        sectionId,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleClick() {
    dispatch(selectQuestion(question.id));

    window.requestAnimationFrame(() => {
      const paperBlock = Array.from(
        document.querySelectorAll("[data-paper-preview] [data-paper-block]"),
      ).find((element) => element.dataset.paperBlock === question.id);

      paperBlock?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function handleAddAnswer() {
    dispatch(
      addOption({
        questionId: question.id,
        option: {
          id: `${question.id}-option-${Date.now()}`,
          text: "",
          correct: false,
        },
      }),
    );
  }

  return (
    <div ref={setNodeRef} style={style} data-paper-question>
      <div
        className={`flex w-full items-center gap-1 rounded text-sm transition ${
          isSelected ? "bg-slate-900 text-white" : "text-slate-600"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-label={`${isExpanded ? "Collapse" : "Expand"} question`}
          aria-expanded={isExpanded}
          className="flex h-8 w-7 shrink-0 items-center justify-center text-xs text-slate-400 hover:text-slate-600"
        >
          {isExpanded ? "▾" : "▸"}
        </button>

        <button
          type="button"
          onClick={handleClick}
          aria-current={isSelected ? "true" : undefined}
          className="flex min-w-0 flex-1 items-center gap-2 py-1.5 pr-2 text-left"
        >
          <span
            className={`shrink-0 text-xs ${
              isSelected ? "text-slate-300" : "text-slate-400"
            }`}
          >
            Q
          </span>

          <span className="min-w-0 flex-1 truncate">
            {getQuestionLabel(question)}
          </span>
        </button>

        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag question ${getQuestionLabel(question)}`}
          className="mr-1 rounded px-1 text-xs text-slate-400 hover:bg-slate-200 hover:text-slate-600 active:cursor-grabbing"
        >
          ⋮⋮
        </button>
      </div>

      {isExpanded && (
        <div className="ml-4 border-l border-slate-200 pl-2">
          {images.map((image, index) => (
            <div
              key={`${question.id}-image-${index}`}
              className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-500"
            >
              <span className="text-slate-400" aria-hidden="true">
                🖼
              </span>
              <span className="min-w-0 truncate">
                {image.attrs?.alt || image.attrs?.caption || "Image"}
              </span>
            </div>
          ))}

          {question.media && (
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-500">
              <span className="text-slate-400">M</span>
              <span>Media</span>
            </div>
          )}

          {isMultipleChoice && (
            <div className="pt-1">
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-slate-600">
                <span className="text-slate-400">A</span>
                <span className="flex-1">Answers</span>
                <span className="text-slate-400">
                  {question.options?.length ?? 0}
                </span>
              </div>

              <div className="ml-3 border-l border-slate-200 pl-2">
                {question.options?.map((option, index) => (
                  <div
                    key={option.id}
                    className="flex items-center gap-2 px-2 py-1 text-xs text-slate-500"
                  >
                    <span className="font-medium text-slate-400">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {option.text ||
                        `Option ${String.fromCharCode(65 + index)}`}
                    </span>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddAnswer}
                  className="px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  + Add Answer
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
