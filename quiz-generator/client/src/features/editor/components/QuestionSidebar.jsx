import { DndContext, closestCenter } from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useDispatch, useSelector } from "react-redux";

import QuestionListItem from "./QuestionListItem";
import SectionManager from "./SectionManager";
import DroppableSection from "./DroppableSection";

import {
  addQuestion,
  assignQuestionToSection,
  moveQuestionToSection,
  reorderQuestionsInSection,
} from "../editorSlice";

export default function QuestionSidebar() {
  const dispatch = useDispatch();

  const questions = useSelector((state) => state.editor.questions);

  const sections = useSelector((state) => state.editor.sections);

  function getQuestionById(questionId) {
    return questions.find((question) => question.id === questionId);
  }

  function getSectionForQuestion(questionId) {
    return sections.find((section) => section.questionIds.includes(questionId));
  }

  function getQuestionsForSection(section) {
    return section.questionIds.map(getQuestionById).filter(Boolean);
  }

  const sectionQuestionIds = new Set(
    sections.flatMap((section) => section.questionIds),
  );

  const unsectionedQuestions = questions.filter(
    (question) => !sectionQuestionIds.has(question.id),
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const questionId = active.id;

    const sourceSection = getSectionForQuestion(questionId);

    /*
     * Determine whether we dropped onto
     * a section or another question.
     */

    const overData = over.data.current;

    let destinationSectionId = null;
    let overQuestionId = null;
    const isUnsectionedDrop = overData?.type === "unsectioned";

    if (overData?.type === "section") {
      destinationSectionId = overData.sectionId;
    } else if (!isUnsectionedDrop) {
      overQuestionId = over.id;

      const destinationSection = getSectionForQuestion(overQuestionId);

      destinationSectionId = destinationSection?.id ?? null;
    }

    if (!destinationSectionId && !isUnsectionedDrop) {
      return;
    }

    if (isUnsectionedDrop) {
      dispatch(
        assignQuestionToSection({
          questionId,
          sectionId: null,
        }),
      );

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

    /*
     * ------------------------------------------------
     * MOVE BETWEEN SECTIONS
     * ------------------------------------------------
     */

    if (sourceSection.id !== destinationSectionId) {
      const destinationSection = sections.find(
        (section) => section.id === destinationSectionId,
      );

      if (!destinationSection) {
        return;
      }

      let targetIndex = destinationSection.questionIds.length;

      /*
       * If dropped onto a question,
       * insert before that question.
       */
      if (overQuestionId) {
        const index = destinationSection.questionIds.indexOf(overQuestionId);

        if (index !== -1) {
          targetIndex = index;
        }
      }

      dispatch(
        moveQuestionToSection({
          questionId,

          fromSectionId: sourceSection.id,

          toSectionId: destinationSection.id,

          targetIndex,
        }),
      );

      return;
    }

    /*
     * ------------------------------------------------
     * REORDER WITHIN SAME SECTION
     * ------------------------------------------------
     */

    if (!overQuestionId || overQuestionId === questionId) {
      return;
    }

    const oldIndex = sourceSection.questionIds.indexOf(questionId);

    const newIndex = sourceSection.questionIds.indexOf(overQuestionId);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    dispatch(
      reorderQuestionsInSection({
        sectionId: sourceSection.id,

        oldIndex,

        newIndex,
      }),
    );
  }

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
    <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
      <SectionManager />

      <div className="border-b border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-900">Questions</h2>

        <p className="text-xs text-slate-400">{questions.length} questions</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => {
              const sectionQuestions = getQuestionsForSection(section);

              return (
                <DroppableSection key={section.id} sectionId={section.id}>
                  <div className="space-y-1">
                    {/* Section label */}

                    <div className="px-1 pb-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Section {sectionIndex + 1}
                      </div>

                      <div className="truncate text-xs font-medium text-slate-700">
                        {section.title || "Untitled Section"}
                      </div>
                    </div>

                    {/* Questions */}

                    <SortableContext
                      items={sectionQuestions.map((question) => question.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-1">
                        {sectionQuestions.map((question) => (
                          <QuestionListItem
                            key={question.id}
                            question={question}
                          />
                        ))}
                      </div>
                    </SortableContext>

                    {/* Empty section */}

                    {sectionQuestions.length === 0 && (
                      <div className="rounded-md border border-dashed border-slate-300 px-3 py-4 text-center text-xs text-slate-400">
                        Drop question here
                      </div>
                    )}
                  </div>
                </DroppableSection>
              );
            })}

            <DroppableSection unsectioned>
              <div className="space-y-1 rounded-md">
                <div className="px-1 pb-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Unsectioned
                  </div>
                </div>

                <SortableContext
                  items={unsectionedQuestions.map((question) => question.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1">
                    {unsectionedQuestions.map((question) => (
                      <QuestionListItem key={question.id} question={question} />
                    ))}
                  </div>
                </SortableContext>

                {unsectionedQuestions.length === 0 && (
                  <div className="rounded-md border border-dashed border-slate-300 px-3 py-3 text-center text-xs text-slate-400">
                    Drop question here
                  </div>
                )}
              </div>
            </DroppableSection>
          </div>
        </DndContext>
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
