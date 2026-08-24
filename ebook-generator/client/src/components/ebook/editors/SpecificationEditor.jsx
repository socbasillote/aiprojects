import { Check, Save } from "lucide-react";

import EditorField from "./EditorField.jsx";
import SelectField from "./SelectField.jsx";
import ArrayEditor from "./ArrayEditor.jsx";
import EmptyState from "./EmptyState.jsx";

const SpecificationEditor = ({
  specification,
  setSpecification,
  approved,
  onSave,
  onApprove,
  onGenerate,
  loading,
}) => {
  if (!specification) {
    return (
      <EmptyState
        title="No specification yet"
        description="Generate a specification from your original ebook prompt."
        action={onGenerate}
        actionLabel="Generate specification"
        loading={loading}
      />
    );
  }

  const update = (field, value) => {
    setSpecification((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-2xl font-semibold">Ebook specification</h2>

          <p className="mt-2 text-sm text-zinc-500">
            Review and refine the AI-generated plan.
          </p>
        </div>

        {approved && (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium">
            <Check size={14} />
            Approved
          </span>
        )}
      </div>

      <div className="mt-8 space-y-6">
        <EditorField
          label="Title"
          value={specification.title}
          onChange={(value) => update("title", value)}
        />

        <EditorField
          label="Subtitle"
          value={specification.subtitle}
          onChange={(value) => update("subtitle", value)}
        />

        <SelectField
          label="Book category"
          value={specification.category}
          onChange={(value) => update("category", value)}
        />

        <EditorField
          label="Target audience"
          value={specification.targetAudience}
          onChange={(value) => update("targetAudience", value)}
        />

        <EditorField
          label="Objective"
          value={specification.objective}
          onChange={(value) => update("objective", value)}
          textarea
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <EditorField
            label="Tone"
            value={specification.tone}
            onChange={(value) => update("tone", value)}
          />

          <EditorField
            label="Writing style"
            value={specification.writingStyle}
            onChange={(value) => update("writingStyle", value)}
          />

          <EditorField
            label="Difficulty"
            value={specification.difficultyLevel}
            onChange={(value) => update("difficultyLevel", value)}
          />

          <EditorField
            label="Language"
            value={specification.language}
            onChange={(value) => update("language", value)}
          />
        </div>

        <ArrayEditor
          label="Themes"
          values={specification.themes}
          onChange={(values) => update("themes", values)}
        />

        <ArrayEditor
          label="Required topics"
          values={specification.requiredTopics}
          onChange={(values) => update("requiredTopics", values)}
        />

        <ArrayEditor
          label="Excluded topics"
          values={specification.excludedTopics}
          onChange={(values) => update("excludedTopics", values)}
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3 border-t border-zinc-200 pt-6">
        <button
          onClick={onSave}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
        >
          <Save size={16} />
          Save changes
        </button>

        {!approved && (
          <button
            onClick={onApprove}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            <Check size={16} />
            Approve specification
          </button>
        )}
      </div>
    </section>
  );
};

export default SpecificationEditor;
