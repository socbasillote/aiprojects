import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { createEbook } from "../features/ebooks/ebookSlice.js";

import DesignTemplateCard from "../components/ebook/DesignTemplateCard.jsx";
import BookSpreadPreview from "../components/ebook/BookSpreadPreview.jsx";
import BookCategoryCard from "../components/ebook/BookCategoryCard.jsx";

import { getDesignTemplatesForCategory } from "../config/ebookDesignTemplates.js";

import {
  EBOOK_CATEGORIES,
  DEFAULT_EBOOK_CATEGORY,
  getEbookCategory,
} from "../config/ebookCategories.js";

const schema = z.object({
  category: z.string().min(1, "Please select a book category."),

  designTemplate: z.string().min(1, "Please select a visual style."),

  title: z.string().min(1, "Ebook title is required.").max(200),

  subtitle: z.string().max(300).optional(),

  description: z.string().min(20, "Please provide a detailed description."),

  authorName: z.string().max(150).optional(),

  targetAudience: z.string().min(1, "Target audience is required."),

  language: z.string().min(1),

  tone: z.string().min(1),

  ebookLength: z.string().min(1),

  chapterCount: z.coerce.number().int().min(1).max(100),

  writingStyle: z.string().min(1),
});

const CreateEbookPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [previewTemplate, setPreviewTemplate] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),

    defaultValues: {
      category: DEFAULT_EBOOK_CATEGORY,

      designTemplate: "custom-minimal",

      title: "",
      subtitle: "",
      description: "",
      authorName: "",

      targetAudience: "",
      language: "English",
      tone: "Practical",
      ebookLength: "15,000–25,000 words",
      chapterCount: 10,
      writingStyle: "Clear and practical",
    },
  });

  const selectedCategoryId = watch("category");

  const selectedCategory = getEbookCategory(selectedCategoryId);

  const selectedDesignTemplate = watch("designTemplate");

  const designTemplates = getDesignTemplatesForCategory(selectedCategoryId);

  /*
   * ---------------------------------------------------------
   * Category selection
   * ---------------------------------------------------------
   */

  const handleCategorySelect = (category) => {
    setValue("category", category.id, {
      shouldDirty: true,
      shouldValidate: true,
    });

    /*
     * Apply category defaults.
     *
     * Example:
     *
     * Children's Book
     * -> friendly tone
     * -> shorter chapters
     * -> playful writing style
     *
     * Non-Fiction
     * -> practical tone
     * -> instructional style
     */
    Object.entries(category.defaults || {}).forEach(([field, value]) => {
      setValue(field, value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });

    /*
     * Automatically select the first
     * visual design available for the category.
     */
    const templates = getDesignTemplatesForCategory(category.id);

    if (templates.length > 0) {
      setValue("designTemplate", templates[0].id, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else {
      setValue("designTemplate", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  /*
   * ---------------------------------------------------------
   * Design selection
   * ---------------------------------------------------------
   */

  const handleDesignSelect = (template) => {
    setValue("designTemplate", template.id, {
      shouldDirty: true,
      shouldValidate: true,
    });

    toast.success(`${template.name} style selected.`);
  };

  /*
   * ---------------------------------------------------------
   * Design preview
   * ---------------------------------------------------------
   */

  const handleDesignPreview = (template) => {
    setPreviewTemplate(template);
  };

  /*
   * ---------------------------------------------------------
   * Use design from preview
   * ---------------------------------------------------------
   */

  const handleUsePreviewDesign = (template) => {
    handleDesignSelect(template);

    setPreviewTemplate(null);
  };

  /*
   * ---------------------------------------------------------
   * Submit
   * ---------------------------------------------------------
   */

  const onSubmit = async (data) => {
    const result = await dispatch(createEbook(data));

    if (createEbook.fulfilled.match(result)) {
      toast.success("Ebook created.");

      navigate(`/ebooks/${result.payload._id}`);

      return;
    }

    toast.error(result.payload || "Unable to create ebook.");
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------ */}

      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-lg p-2 hover:bg-zinc-100"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="font-semibold text-zinc-900">Create ebook</h1>

            <p className="text-xs text-zinc-500">
              Choose a book type, visual style, and configure your ebook.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Hidden category field */}
          <input type="hidden" {...register("category")} />

          {/* Hidden design template field */}
          <input type="hidden" {...register("designTemplate")} />

          {/* ------------------------------------------------ */}
          {/* BOOK CATEGORY */}
          {/* ------------------------------------------------ */}

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                Choose a book type
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Your selection will apply recommended default settings. You can
                customize them below.
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {EBOOK_CATEGORIES.map((category) => (
                <BookCategoryCard
                  key={category.id}
                  category={category}
                  selected={selectedCategoryId === category.id}
                  onSelect={handleCategorySelect}
                />
              ))}
            </div>

            {errors.category?.message && (
              <p className="mt-3 text-xs text-red-600">
                {errors.category.message}
              </p>
            )}

            {selectedCategory && (
              <div className="mt-5 rounded-xl bg-zinc-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Selected book type
                </p>

                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  {selectedCategory.name}
                </p>
              </div>
            )}
          </section>

          {/* ------------------------------------------------ */}
          {/* VISUAL DESIGN */}
          {/* ------------------------------------------------ */}

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  Choose a visual style
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Select the visual design that will guide the ebook layout,
                  typography, spacing, and image placement.
                </p>
              </div>

              {selectedDesignTemplate && (
                <div className="text-xs text-zinc-400">Style selected</div>
              )}
            </div>

            {designTemplates.length > 0 ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {designTemplates.map((template) => (
                  <DesignTemplateCard
                    key={template.id}
                    template={template}
                    selected={selectedDesignTemplate === template.id}
                    onPreview={handleDesignPreview}
                    onSelect={handleDesignSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-zinc-300 p-8 text-center">
                <p className="text-sm text-zinc-500">
                  No design templates are available for this category yet.
                </p>
              </div>
            )}

            {errors.designTemplate?.message && (
              <p className="mt-3 text-xs text-red-600">
                {errors.designTemplate.message}
              </p>
            )}
          </section>

          {/* ------------------------------------------------ */}
          {/* EBOOK BASICS */}
          {/* ------------------------------------------------ */}

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              Ebook basics
            </h2>

            <div className="mt-6 space-y-5">
              <Field
                label="Ebook title"
                error={errors.title?.message}
                input={
                  <input
                    {...register("title")}
                    placeholder="The Beginner's Guide to Starting an Online Business"
                    className={inputClass}
                  />
                }
              />

              <Field
                label="Subtitle"
                error={errors.subtitle?.message}
                input={
                  <input
                    {...register("subtitle")}
                    placeholder="A practical roadmap..."
                    className={inputClass}
                  />
                }
              />

              <Field
                label="Author name"
                error={errors.authorName?.message}
                input={
                  <input
                    {...register("authorName")}
                    placeholder="Optional"
                    className={inputClass}
                  />
                }
              />

              <Field
                label="Describe your ebook"
                error={errors.description?.message}
                input={
                  <textarea
                    {...register("description")}
                    rows={9}
                    placeholder="I want to create an ebook about starting a small online business for complete beginners. Explain how to choose a niche, validate an idea, create an offer, find the first customers, and build repeatable systems..."
                    className={`${inputClass} resize-y`}
                  />
                }
              />
            </div>
          </section>

          {/* ------------------------------------------------ */}
          {/* WRITING SETTINGS */}
          {/* ------------------------------------------------ */}

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                Writing settings
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                These settings start with recommendations for your selected book
                type. You can change them before creating the ebook.
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field
                label="Target audience"
                error={errors.targetAudience?.message}
                input={
                  <input
                    {...register("targetAudience")}
                    placeholder="Complete beginners"
                    className={inputClass}
                  />
                }
              />

              <Field
                label="Language"
                error={errors.language?.message}
                input={
                  <select {...register("language")} className={inputClass}>
                    <option>English</option>
                    <option>Filipino</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                }
              />

              <Field
                label="Tone"
                error={errors.tone?.message}
                input={
                  <select {...register("tone")} className={inputClass}>
                    <option>Practical</option>
                    <option>Informative</option>
                    <option>Friendly and playful</option>
                    <option>Professional</option>
                    <option>Conversational</option>
                    <option>Academic</option>
                    <option>Persuasive</option>
                  </select>
                }
              />

              <Field
                label="Approximate length"
                error={errors.ebookLength?.message}
                input={
                  <select {...register("ebookLength")} className={inputClass}>
                    <option>5,000–10,000 words</option>

                    <option>10,000–15,000 words</option>

                    <option>15,000–25,000 words</option>

                    <option>25,000–40,000 words</option>

                    <option>40,000+ words</option>
                  </select>
                }
              />

              <Field
                label="Number of chapters"
                error={errors.chapterCount?.message}
                input={
                  <input
                    {...register("chapterCount")}
                    type="number"
                    min="1"
                    max="100"
                    className={inputClass}
                  />
                }
              />

              <Field
                label="Writing style"
                error={errors.writingStyle?.message}
                input={
                  <input {...register("writingStyle")} className={inputClass} />
                }
              />
            </div>
          </section>

          {/* ------------------------------------------------ */}
          {/* SUMMARY */}
          {/* ------------------------------------------------ */}

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              Ready to create
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <SummaryItem label="Book type" value={selectedCategory?.name} />

              <SummaryItem
                label="Visual style"
                value={
                  designTemplates.find(
                    (template) => template.id === selectedDesignTemplate,
                  )?.name
                }
              />

              <SummaryItem label="Language" value={watch("language")} />

              <SummaryItem
                label="Target audience"
                value={watch("targetAudience")}
              />

              <SummaryItem label="Length" value={watch("ebookLength")} />

              <SummaryItem label="Chapters" value={watch("chapterCount")} />

              <SummaryItem
                label="Writing style"
                value={watch("writingStyle")}
              />
            </div>
          </section>

          {/* ------------------------------------------------ */}
          {/* SUBMIT */}
          {/* ------------------------------------------------ */}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create ebook"}
            </button>
          </div>
        </form>
      </main>

      {/* -------------------------------------------------- */}
      {/* DESIGN PREVIEW MODAL */}
      {/* -------------------------------------------------- */}

      {previewTemplate && (
        <BookSpreadPreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSelect={handleUsePreviewDesign}
        />
      )}
    </div>
  );
};

/* ---------------------------------------------------------- */
/* Summary item */
/* ---------------------------------------------------------- */

const SummaryItem = ({ label, value }) => (
  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
    <p className="text-xs text-zinc-400">{label}</p>

    <p className="mt-1 text-sm font-medium text-zinc-900">
      {value || "Not specified"}
    </p>
  </div>
);

/* ---------------------------------------------------------- */
/* Form field */
/* ---------------------------------------------------------- */

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900";

const Field = ({ label, error, input }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-zinc-900">
      {label}
    </label>

    {input}

    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

export default CreateEbookPage;
