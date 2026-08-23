import { Check, RefreshCw, Save } from "lucide-react";

import EditorField from "../EditorField.jsx";
import EmptyState from "../EmptyState.jsx";

const OutlineEditor = ({
  outline,
  setOutline,
  specificationApproved,
  onGenerate,
  onSave,
  onApprove,
  loading,
}) => {
  if (!specificationApproved) {
    return (
      <EmptyState
        title="Approve the specification first"
        description="The outline can only be generated after the ebook specification has been reviewed and approved."
      />
    );
  }

  if (!outline) {
    return (
      <EmptyState
        title="No outline yet"
        description="Generate an outline from the approved specification."
        action={onGenerate}
        actionLabel="Generate outline"
        loading={loading}
      />
    );
  }

  const updateChapter = (index, field, value) => {
    setOutline((current) => ({
      ...current,
      chapters: current.chapters.map((chapter, chapterIndex) =>
        chapterIndex === index
          ? {
              ...chapter,
              [field]: value,
            }
          : chapter,
      ),
    }));
  };

  return (
    <section>
      <div className="flex justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Ebook outline</h2>

          <p className="mt-2 text-sm text-zinc-500">
            Review the structure before chapter generation.
          </p>
        </div>

        <button
          onClick={onGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
        >
          <RefreshCw size={15} />
          Regenerate
        </button>
      </div>

      <div className="mt-8 space-y-5">
        {outline.chapters.map((chapter, index) => (
          <div
            key={`${chapter.chapterNumber}-${index}`}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-semibold">
                {index + 1}
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                <EditorField
                  label="Chapter title"
                  value={chapter.title}
                  onChange={(value) => updateChapter(index, "title", value)}
                />

                <EditorField
                  label="Purpose"
                  value={chapter.purpose}
                  onChange={(value) => updateChapter(index, "purpose", value)}
                  textarea
                />

                <EditorField
                  label="Summary"
                  value={chapter.summary}
                  onChange={(value) => updateChapter(index, "summary", value)}
                  textarea
                />

                <EditorField
                  label="Estimated words"
                  type="number"
                  value={chapter.estimatedWordCount}
                  onChange={(value) =>
                    updateChapter(index, "estimatedWordCount", Number(value))
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3 border-t border-zinc-200 pt-6">
        <button
          onClick={onSave}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
        >
          <Save size={16} />
          Save outline
        </button>

        <button
          onClick={onApprove}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          <Check size={16} />
          Approve outline
        </button>
      </div>
    </section>
  );
};

export default OutlineEditor;
