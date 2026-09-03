import { useDispatch, useSelector } from "react-redux";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  addSection,
  addQuestion,
  assignQuestionToSection,
  moveQuestionToSection,
  reorderUnsectionedQuestions,
  reorderQuestionsInSection,
  reorderSections,
} from "../../editor/editorSlice";
import PaperTreeQuestion from "./PaperTreeQuestion";
import PaperTreeSection from "./PaperTreeSection";

export default function PaperDocumentTree() {
  const dispatch = useDispatch();
  const sections = useSelector((state) => state.editor.sections);
  const questions = useSelector((state) => state.editor.questions);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const sectionQuestionIds = new Set(
    sections.flatMap((section) => section.questionIds),
  );
  const unsectionedQuestions = questions.filter(
    (question) => !sectionQuestionIds.has(question.id),
  );

  function getSectionForQuestion(questionId) {
    return sections.find((section) => section.questionIds.includes(questionId));
  }

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) {
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === "section" && overData?.type === "section") {
      const oldIndex = sections.findIndex(
        (section) => `section-${section.id}` === active.id,
      );
      const newIndex = sections.findIndex(
        (section) => `section-${section.id}` === over.id,
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        dispatch(reorderSections({ oldIndex, newIndex }));
      }

      return;
    }

    if (activeData?.type !== "question") {
      return;
    }

    const questionId = active.id;
    const sourceSection = getSectionForQuestion(questionId);
    const destinationSectionId =
      overData?.type === "question"
        ? overData.sectionId
        : overData?.type === "section"
          ? overData.sectionId
          : overData?.type === "unsectioned"
            ? null
            : undefined;

    if (destinationSectionId === undefined) {
      return;
    }

    if (!destinationSectionId) {
      if (sourceSection) {
        dispatch(assignQuestionToSection({ questionId, sectionId: null }));
      } else if (overData?.type === "question") {
        dispatch(
          reorderUnsectionedQuestions({
            oldIndex: unsectionedQuestions.findIndex(
              (question) => question.id === questionId,
            ),
            newIndex: unsectionedQuestions.findIndex(
              (question) => question.id === over.id,
            ),
          }),
        );
      }

      return;
    }

    if (!sourceSection) {
      dispatch(
        assignQuestionToSection({
          questionId,
          sectionId: destinationSectionId,
        }),
      );
      return;
    }

    if (sourceSection.id !== destinationSectionId) {
      const destinationSection = sections.find(
        (section) => section.id === destinationSectionId,
      );

      if (!destinationSection) {
        return;
      }

      const targetIndex =
        overData?.type === "question"
          ? destinationSection.questionIds.indexOf(over.id)
          : destinationSection.questionIds.length;

      dispatch(
        moveQuestionToSection({
          questionId,
          fromSectionId: sourceSection.id,
          toSectionId: destinationSectionId,
          targetIndex,
        }),
      );
      return;
    }

    if (overData?.type === "question") {
      dispatch(
        reorderQuestionsInSection({
          sectionId: sourceSection.id,
          oldIndex: sourceSection.questionIds.indexOf(questionId),
          newIndex: sourceSection.questionIds.indexOf(over.id),
        }),
      );
    }
  }

  function handleAddSection() {
    dispatch(
      addSection({
        title: "New Section",
        instructions: "",
      }),
    );
  }

  function handleAddQuestion(sectionId = null) {
    const id = `question-${Date.now()}`;

    dispatch(
      addQuestion({
        id,
        type: "multiple_choice",
        content: {
          type: "doc",
          content: [{ type: "paragraph", content: [] }],
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

    if (sectionId) {
      dispatch(assignQuestionToSection({ questionId: id, sectionId }));
    }
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Document</h2>
        <p className="mt-0.5 text-xs text-slate-400">Paper structure</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-1">
            <SortableContext
              items={sections.map((section) => `section-${section.id}`)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section, index) => (
                <PaperTreeSection
                  key={section.id}
                  section={section}
                  fallbackTitle={`Section ${index + 1}`}
                  questions={questions}
                  onAddQuestion={handleAddQuestion}
                />
              ))}
            </SortableContext>

            <UnsectionedTree
              questions={unsectionedQuestions}
              onAddQuestion={handleAddQuestion}
            />
          </div>
        </DndContext>
      </div>

      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={handleAddSection}
          className="w-full rounded border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50"
        >
          + Add Section
        </button>
      </div>
    </aside>
  );
}

function UnsectionedTree({ questions, onAddQuestion }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "unsectioned",
    data: {
      type: "unsectioned",
    },
  });

  return (
    <section
      ref={setNodeRef}
      data-sortable-section="unsectioned"
      className={`pt-2 ${isOver ? "rounded bg-blue-50" : ""}`}
    >
      <div className="group flex items-center justify-between px-2 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Unsectioned
        </span>
        <button
          type="button"
          onClick={() => onAddQuestion()}
          aria-label="Add question to unsectioned questions"
          className="rounded px-1.5 text-sm font-medium text-slate-400 opacity-0 transition-opacity hover:bg-slate-200 hover:text-slate-700 group-hover:opacity-100"
        >
          +
        </button>
      </div>
      <div className="ml-3 border-l border-slate-200 pl-2">
        <SortableContext
          items={questions.map((question) => question.id)}
          strategy={verticalListSortingStrategy}
        >
          {questions.map((question) => (
            <PaperTreeQuestion key={question.id} question={question} />
          ))}
        </SortableContext>
      </div>
    </section>
  );
}
