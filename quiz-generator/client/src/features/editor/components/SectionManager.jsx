import { useDispatch, useSelector } from "react-redux";

import { addSection, deleteSection, updateSection } from "../editorSlice";

export default function SectionManager() {
  const dispatch = useDispatch();

  const sections = useSelector((state) => state.editor.sections);

  const questions = useSelector((state) => state.editor.questions);

  function handleAddSection() {
    dispatch(
      addSection({
        title: `New Section`,
        instructions: "",
      }),
    );
  }

  function handleTitleChange(sectionId, value) {
    dispatch(
      updateSection({
        sectionId,
        changes: {
          title: value,
        },
      }),
    );
  }

  function handleInstructionsChange(sectionId, value) {
    dispatch(
      updateSection({
        sectionId,
        changes: {
          instructions: value,
        },
      }),
    );
  }

  function handleDeleteSection(sectionId) {
    dispatch(
      deleteSection({
        sectionId,
      }),
    );
  }

  function getQuestionCount(section) {
    return section.questionIds.filter((questionId) =>
      questions.some((question) => question.id === questionId),
    ).length;
  }

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Exam Structure</h2>

        <p className="mt-0.5 text-xs text-slate-400">
          Organize questions into sections
        </p>
      </div>

      <div className="space-y-2 p-3">
        {sections.map((section, index) => {
          const questionCount = getQuestionCount(section);

          return (
            <div
              key={section.id}
              className="rounded-lg border border-slate-200 bg-slate-50"
            >
              {/* Section header */}
              <div className="flex items-start gap-2 p-3">
                <div className="mt-1 cursor-grab text-slate-400">⋮⋮</div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Section {index + 1}
                  </div>

                  <input
                    type="text"
                    value={section.title}
                    onChange={(event) =>
                      handleTitleChange(section.id, event.target.value)
                    }
                    className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                    placeholder="Section title"
                  />

                  <div className="mt-1 text-xs text-slate-400">
                    {questionCount}{" "}
                    {questionCount === 1 ? "question" : "questions"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteSection(section.id)}
                  disabled={sections.length <= 1}
                  className="rounded px-1.5 py-1 text-xs text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                  title={
                    sections.length <= 1
                      ? "At least one section is required"
                      : "Delete section"
                  }
                >
                  ×
                </button>
              </div>

              {/* Section instructions */}
              <div className="border-t border-slate-200 px-3 py-2">
                <textarea
                  value={section.instructions}
                  onChange={(event) =>
                    handleInstructionsChange(section.id, event.target.value)
                  }
                  rows={2}
                  placeholder="Section instructions..."
                  className="w-full resize-none border-0 bg-transparent text-xs leading-5 text-slate-600 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={handleAddSection}
          className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50"
        >
          + Add Section
        </button>
      </div>
    </section>
  );
}
