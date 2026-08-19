import { useEffect, useState } from "react";

import { useParams, Link } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { ArrowLeft, Check, Loader2, RefreshCw, Save } from "lucide-react";

import {
  fetchEbook,
  generateSpecification,
  updateSpecification,
  approveSpecification,
  generateOutline,
  updateOutline,
  approveOutline,
  generateChapters,
  approveChapters,
  generateImagePlan,
  approveImagePlan,
  setCurrentEbook,
  generateImages,
  approveImages,
  generateCover,
  approveCover,
} from "../features/ebooks/ebookSlice.js";

import ChaptersEditor from "./ChaptersEditor.jsx";
import ImagesEditor from "./ImagesEditor.jsx";

import { toast } from "sonner";
import CoverEditor from "./CoverEditor.jsx";

const EbookWorkspacePage = () => {
  const { id } = useParams();

  const dispatch = useDispatch();

  const {
    current: ebook,
    loading,
    operationLoading,
    error,
  } = useSelector((state) => state.ebooks);

  const [activeTab, setActiveTab] = useState("overview");

  const [specification, setSpecification] = useState(null);

  const [outline, setOutline] = useState(null);

  useEffect(() => {
    dispatch(fetchEbook(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (ebook?.specification) {
      setSpecification(ebook.specification);
    }

    if (ebook?.outline) {
      setOutline(ebook.outline);
    }
  }, [ebook]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (loading && !ebook) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>
          <h1 className="font-semibold">Ebook not found</h1>

          <Link to="/" className="mt-3 inline-block text-sm underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleGenerateSpecification = async () => {
    const result = await dispatch(generateSpecification(id));

    if (generateSpecification.fulfilled.match(result)) {
      toast.success("Specification generated.");

      setActiveTab("specification");
    }
  };

  const handleSaveSpecification = async () => {
    const result = await dispatch(
      updateSpecification({
        ebookId: id,
        specification,
      }),
    );

    if (updateSpecification.fulfilled.match(result)) {
      toast.success("Specification saved.");
    }
  };

  const handleApproveSpecification = async () => {
    const result = await dispatch(approveSpecification(id));

    if (approveSpecification.fulfilled.match(result)) {
      const approvedEbook = result.payload;

      console.log("APPROVED EBOOK:", approvedEbook);

      console.log("APPROVED:", approvedEbook?.specificationApproved);

      toast.success("Specification approved.");

      setActiveTab("outline");
    }
  };

  const handleGenerateOutline = async () => {
    const result = await dispatch(generateOutline(id));

    if (generateOutline.fulfilled.match(result)) {
      toast.success("Outline generated.");

      setActiveTab("outline");
    }
  };

  const handleSaveOutline = async () => {
    const result = await dispatch(
      updateOutline({
        ebookId: id,
        outline,
      }),
    );

    if (updateOutline.fulfilled.match(result)) {
      toast.success("Outline saved.");
    }
  };

  const handleApproveOutline = async () => {
    const result = await dispatch(approveOutline(id));

    if (approveOutline.fulfilled.match(result)) {
      const approvedEbook = result.payload;

      toast.success("Outline approved.");

      dispatch(setCurrentEbook(approvedEbook));

      setActiveTab("chapters");
    }
  };

  const handleGenerateChapters = async () => {
    const result = await dispatch(generateChapters(id));

    if (generateChapters.fulfilled.match(result)) {
      toast.success("Chapters generated successfully.");
    }
  };

  const handleApproveChapters = async () => {
    const result = await dispatch(approveChapters(id));

    if (approveChapters.fulfilled.match(result)) {
      const approvedEbook = result.payload;

      dispatch(setCurrentEbook(approvedEbook));

      toast.success("Chapters approved.");
      setActiveTab("images");
    }
  };

  const handleGenerateImagePlan = async () => {
    const result = await dispatch(generateImagePlan(id));

    if (generateImagePlan.fulfilled.match(result)) {
      toast.success("Image plan generated.");
    }
  };

  const handleApproveImagePlan = async () => {
    const result = await dispatch(approveImagePlan(id));

    if (approveImagePlan.fulfilled.match(result)) {
      const approvedEbook = result.payload;

      dispatch(setCurrentEbook(approvedEbook));

      toast.success("Image plan approved.");
    }
  };

  const handleGenerateImages = async () => {
    const result = await dispatch(generateImages(id));

    if (generateImages.fulfilled.match(result)) {
      toast.success("Images generated successfully.");
    }
  };

  const handleApproveImages = async () => {
    const result = await dispatch(approveImages(id));

    if (approveImages.fulfilled.match(result)) {
      const approvedEbook = result.payload;

      dispatch(setCurrentEbook(approvedEbook));

      toast.success("Images approved.");

      setActiveTab("cover");
    }
  };

  const handleGenerateCover = async () => {
    console.log("GENERATE COVER CLICKED");

    const result = await dispatch(generateCover(id));

    console.log("GENERATE COVER RESULT:", result);

    if (generateCover.fulfilled.match(result)) {
      const generatedEbook = result.payload;

      console.log("GENERATED COVER EBOOK:", generatedEbook);
      console.log("GENERATED COVER:", generatedEbook?.cover);
      console.log("GENERATED COVER STATUS:", generatedEbook?.cover?.status);
      console.log("GENERATED COVER URL:", generatedEbook?.cover?.url);

      dispatch(setCurrentEbook(generatedEbook));

      toast.success("Cover generated successfully.");
    }
  };

  const handleApproveCover = async () => {
    const result = await dispatch(approveCover(id));

    if (approveCover.fulfilled.match(result)) {
      const completedEbook = result.payload;

      dispatch(setCurrentEbook(completedEbook));

      toast.success("Ebook completed successfully.");

      /*
       * Stay on cover for now so the user
       * can see the completed state.
       */
    }
  };

  console.log("COVER FROM BACKEND:", ebook?.cover);
  console.log("COVER STATUS:", ebook?.cover?.status);
  console.log("EBOOK STATUS:", ebook?.status);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="rounded-lg p-2 hover:bg-zinc-100">
              <ArrowLeft size={18} />
            </Link>

            <div>
              <h1 className="font-semibold">{ebook.title}</h1>

              <p className="text-xs capitalize text-zinc-500">
                {ebook.status?.replace(/_/g, " ")}
              </p>
            </div>
          </div>

          {operationLoading && (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 size={15} className="animate-spin" />
              AI is working...
            </div>
          )}
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden w-60 shrink-0 border-r border-zinc-200 bg-white p-4 md:block">
          <nav className="space-y-1">
            {[
              ["overview", "Overview"],
              ["specification", "Specification"],
              ["outline", "Outline"],
              ["chapters", "Chapters"],
              ["images", "Images"],
              ["cover", "Cover"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm ${
                  activeTab === value
                    ? "bg-zinc-100 font-medium"
                    : "text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-6">
          <div className="mx-auto max-w-5xl">
            {activeTab === "overview" && (
              <Overview
                ebook={ebook}
                onGenerateSpecification={handleGenerateSpecification}
                operationLoading={operationLoading}
              />
            )}

            {activeTab === "specification" && (
              <SpecificationEditor
                specification={specification}
                setSpecification={setSpecification}
                approved={ebook.specificationApproved}
                onSave={handleSaveSpecification}
                onApprove={handleApproveSpecification}
                onGenerate={handleGenerateSpecification}
                loading={operationLoading}
              />
            )}

            {activeTab === "outline" && (
              <OutlineEditor
                outline={outline}
                setOutline={setOutline}
                specificationApproved={ebook.specificationApproved}
                onGenerate={handleGenerateOutline}
                onSave={handleSaveOutline}
                onApprove={handleApproveOutline}
                loading={operationLoading}
              />
            )}

            {activeTab === "chapters" && (
              <ChaptersEditor
                ebook={ebook}
                onGenerate={handleGenerateChapters}
                onApprove={handleApproveChapters}
                loading={operationLoading}
              />
            )}

            {activeTab === "images" && (
              <ImagesEditor
                ebook={ebook}
                onGenerate={handleGenerateImagePlan}
                onApprove={handleApproveImagePlan}
                onGenerateImages={handleGenerateImages}
                onApproveImages={handleApproveImages}
                loading={operationLoading}
              />
            )}

            {activeTab === "cover" && (
              <CoverEditor
                ebook={ebook}
                onGenerate={handleGenerateCover}
                onApprove={handleApproveCover}
                loading={operationLoading}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const Overview = ({ ebook, onGenerateSpecification, operationLoading }) => (
  <section>
    <h2 className="text-2xl font-semibold">Ebook overview</h2>

    <p className="mt-2 text-sm text-zinc-500">
      Move through the planning stages before generating chapters.
    </p>

    <div className="mt-8 grid gap-5 sm:grid-cols-3">
      <Stat label="Status" value={ebook.status?.replace(/_/g, " ")} />

      <Stat label="Chapters" value={ebook.chapterCount || 0} />

      <Stat label="Words" value={ebook.wordCount || 0} />
    </div>

    {!ebook.specification && (
      <button
        onClick={onGenerateSpecification}
        disabled={operationLoading}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {operationLoading && <Loader2 size={16} className="animate-spin" />}
        Generate specification
      </button>
    )}
  </section>
);

const Stat = ({ label, value }) => (
  <div className="rounded-xl border border-zinc-200 bg-white p-5">
    <p className="text-xs uppercase tracking-wide text-zinc-400">{label}</p>

    <p className="mt-2 text-xl font-semibold capitalize">{value}</p>
  </div>
);

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

const EditorField = ({
  label,
  value,
  onChange,
  textarea = false,
  type = "text",
}) => (
  <div>
    <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">
      {label}
    </label>

    {textarea ? (
      <textarea
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full resize-y rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
      />
    ) : (
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
      />
    )}
  </div>
);

const ArrayEditor = ({ label, values = [], onChange }) => (
  <div>
    <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">
      {label}
    </label>

    <textarea
      value={values.join("\n")}
      onChange={(event) =>
        onChange(
          event.target.value
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
        )
      }
      rows={5}
      placeholder="One item per line"
      className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
    />
  </div>
);

const EmptyState = ({ title, description, action, actionLabel, loading }) => (
  <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
    <h2 className="font-semibold">{title}</h2>

    <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">{description}</p>

    {action && (
      <button
        onClick={action}
        disabled={loading}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}

        {actionLabel}
      </button>
    )}
  </div>
);

export default EbookWorkspacePage;
