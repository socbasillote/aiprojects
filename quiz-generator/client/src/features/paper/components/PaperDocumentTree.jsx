import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
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
import {
  bankQuestionToEditorQuestion,
  questionBankQuestions,
  questionTypeLabels,
} from "../../question-banks/questionBankData";
import { generateQuestionPreview } from "../../../api/assessmentApi";

export default function PaperDocumentTree() {
  const dispatch = useDispatch();
  const { assessmentId } = useParams();
  const [addQuestionTarget, setAddQuestionTarget] = useState(null);
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
            text: "",
            correct: false,
          },
          {
            id: `${id}-option-2`,
            text: "",
            correct: false,
          },
        ],
        answer: null,
        points: 1,
        difficulty: "medium",
      }),
    );

    if (sectionId) {
      dispatch(assignQuestionToSection({ questionId: id, sectionId }));
    }
  }

  function handleAddBankQuestions(selectedQuestions, sectionId = null) {
    selectedQuestions.forEach((question) => {
      const editorQuestion = bankQuestionToEditorQuestion(question);
      dispatch(addQuestion(editorQuestion));
      dispatch(
        assignQuestionToSection({ questionId: editorQuestion.id, sectionId }),
      );
    });
  }

  async function handleGenerateQuestions(settings, sectionId = null) {
    const generatedQuestions = await generateQuestionPreview(assessmentId, {
      subject: settings.subject,
      gradeLevel: settings.gradeLevel,
      topic: settings.topic,
      questionCount: Number(settings.count),
      questionTypes: [settings.type],
      difficulty: settings.difficulty,
      language: settings.language,
      instructions: settings.instructions,
    });

    generatedQuestions.forEach((question) => {
      const editorQuestion = normalizeGeneratedQuestion(question);
      dispatch(addQuestion(editorQuestion));
      dispatch(
        assignQuestionToSection({ questionId: editorQuestion.id, sectionId }),
      );
    });

    return generatedQuestions.length;
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
                  onOpenAddQuestion={setAddQuestionTarget}
                />
              ))}
            </SortableContext>

            <UnsectionedTree
              questions={unsectionedQuestions}
              onOpenAddQuestion={setAddQuestionTarget}
            />
          </div>
        </DndContext>
      </div>

      {addQuestionTarget &&
        !addQuestionTarget.bank &&
        !addQuestionTarget.generate && (
          <AddQuestionMenu
            onClose={() => setAddQuestionTarget(null)}
            onCreate={() => {
              setAddQuestionTarget(null);
              handleAddQuestion(addQuestionTarget);
            }}
            onGenerate={() => {
              setAddQuestionTarget({
                sectionId: addQuestionTarget,
                generate: true,
              });
            }}
            onBank={() =>
              setAddQuestionTarget({
                sectionId: addQuestionTarget,
                bank: true,
              })
            }
          />
        )}

      {addQuestionTarget?.bank && (
        <QuestionBankDialog
          onClose={() => setAddQuestionTarget(null)}
          onAdd={(selectedQuestions) => {
            handleAddBankQuestions(
              selectedQuestions,
              addQuestionTarget.sectionId,
            );
            setAddQuestionTarget(null);
          }}
        />
      )}

      {addQuestionTarget?.generate && (
        <GenerateQuestionDialog
          onClose={() => setAddQuestionTarget(null)}
          onGenerate={async (settings) => {
            const count = await handleGenerateQuestions(
              settings,
              addQuestionTarget.sectionId,
            );
            setAddQuestionTarget(null);
            return count;
          }}
        />
      )}

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

function normalizeGeneratedQuestion(question) {
  return {
    ...question,
    content:
      typeof question.content === "string"
        ? {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: question.content }],
              },
            ],
          }
        : question.content,
    options: (question.options ?? []).map((option) => ({
      ...option,
      correct: option.correct ?? option.isCorrect ?? false,
    })),
  };
}

function UnsectionedTree({ questions, onOpenAddQuestion }) {
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
          onClick={() => onOpenAddQuestion(null)}
          aria-label="Add question to unsectioned questions"
          className="rounded px-1.5 text-sm font-medium text-slate-400 hover:bg-slate-200 hover:text-slate-700"
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

function AddQuestionMenu({ onClose, onCreate, onGenerate, onBank }) {
  return (
    <div className="fixed inset-0 z-40 bg-slate-900/20" onClick={onClose}>
      <div
        className="absolute left-72 top-16 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="px-2 pb-2 text-sm font-semibold text-slate-900">
          Add Question
        </h2>
        <div className="space-y-1">
          <MenuAction label="Create New" onClick={onCreate} />
          <MenuAction label="Generate with AI" onClick={onGenerate} />
          <MenuAction label="From Question Bank" onClick={onBank} />
        </div>
      </div>
    </div>
  );
}

function MenuAction({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full rounded px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
    >
      + {label}
    </button>
  );
}

function QuestionBankDialog({ onClose, onAdd }) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const visibleQuestions = questionBankQuestions.filter((question) =>
    `${question.title} ${question.text}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  function toggleQuestion(questionId) {
    setSelectedIds((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId],
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Add from Question Bank
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xl text-slate-400"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search..."
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
        <div className="mt-4 max-h-72 space-y-1 overflow-y-auto">
          {visibleQuestions.map((question) => (
            <label
              key={question.id}
              className="flex cursor-pointer gap-3 rounded-lg px-2 py-3 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(question.id)}
                onChange={() => toggleQuestion(question.id)}
                className="mt-1 h-4 w-4 accent-slate-900"
              />
              <span>
                <span className="block text-sm font-medium text-slate-800">
                  {question.title}
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  {questionTypeLabels[question.type]} · {question.grade} ·{" "}
                  {question.difficulty}
                </span>
              </span>
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedIds.length}
            onClick={() =>
              onAdd(
                questionBankQuestions.filter((question) =>
                  selectedIds.includes(question.id),
                ),
              )
            }
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add {selectedIds.length} Question
            {selectedIds.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GenerateQuestionDialog({ onClose, onGenerate }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({
    subject: "Biology",
    gradeLevel: "Grade 8",
    topic: "",
    count: 1,
    type: "multiple_choice",
    difficulty: "medium",
    points: 1,
    language: "English",
    instructions: "",
  });

  function updateSetting(field, value) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setIsGenerating(true);
    setError("");
    onGenerate({
      ...settings,
      count: Math.min(20, Math.max(1, Number(settings.count))),
      points: Math.max(1, Number(settings.points)),
    })
      .catch((generationError) => {
        setError(
          generationError.message || "Questions could not be generated.",
        );
      })
      .finally(() => setIsGenerating(false));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Generate Questions with AI
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xl text-slate-400"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="text-sm text-slate-500">
          Describe the questions you want to add to this section.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-slate-700">
            Subject
            <input
              value={settings.subject}
              onChange={(event) => updateSetting("subject", event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            Grade level
            <input
              value={settings.gradeLevel}
              onChange={(event) =>
                updateSetting("gradeLevel", event.target.value)
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            Topic
            <input
              value={settings.topic}
              onChange={(event) => updateSetting("topic", event.target.value)}
              placeholder="e.g. Photosynthesis"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            How many
            <input
              type="number"
              min="1"
              max="20"
              value={settings.count}
              onChange={(event) => updateSetting("count", event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            Question type
            <select
              value={settings.type}
              onChange={(event) => updateSetting("type", event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              {Object.entries(questionTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-700">
            Difficulty
            <select
              value={settings.difficulty}
              onChange={(event) =>
                updateSetting("difficulty", event.target.value)
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label className="text-sm text-slate-700">
            Points
            <input
              type="number"
              min="1"
              value={settings.points}
              onChange={(event) => updateSetting("points", event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            Language
            <input
              value={settings.language}
              onChange={(event) =>
                updateSetting("language", event.target.value)
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        </div>
        <label className="block text-sm text-slate-700">
          Additional instructions
          <textarea
            value={settings.instructions}
            onChange={(event) =>
              updateSetting("instructions", event.target.value)
            }
            rows="3"
            placeholder="Optional focus, standards, or constraints"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={isGenerating}
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex min-w-36 items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-wait disabled:opacity-70"
          >
            {isGenerating && (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
            )}
            {isGenerating
              ? "Generating..."
              : `Generate ${settings.count} Question${Number(settings.count) === 1 ? "" : "s"}`}
          </button>
        </div>
      </form>
    </div>
  );
}
