import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import { useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";

import { ArrowLeft } from "lucide-react";

import { createEbook } from "../features/ebooks/ebookSlice.js";

import { toast } from "sonner";

const schema = z.object({
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

  contentType: z.string().min(1),
});

const CreateEbookPage = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),

    defaultValues: {
      language: "English",
      tone: "Practical",
      ebookLength: "15,000–25,000 words",
      chapterCount: 10,
      writingStyle: "Clear and practical",
      contentType: "Non-Fiction",
    },
  });

  const onSubmit = async (data) => {
    const result = await dispatch(createEbook(data));

    if (createEbook.fulfilled.match(result)) {
      toast.success("Ebook created.");

      navigate(`/ebooks/${result.payload._id}`);
    } else {
      toast.error(result.payload || "Unable to create ebook.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
          <button
            onClick={() => navigate("/")}
            className="rounded-lg p-2 hover:bg-zinc-100"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="font-semibold">Create ebook</h1>

            <p className="text-xs text-zinc-500">
              Tell us what you want to create.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Ebook basics</h2>

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

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold">Writing settings</h2>

              <p className="mt-1 text-sm text-zinc-500">
                These settings guide the AI when creating your ebook
                specification.
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
                label="Book category"
                error={errors.contentType?.message}
                input={
                  <select {...register("contentType")} className={inputClass}>
                    <option>Fiction</option>
                    <option>Children's Books</option>
                    <option>Non-Fiction</option>
                    <option>Specialized / Lifestyle</option>
                    <option>Professional &amp; Practical</option>
                  </select>
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

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create ebook"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900";

const Field = ({ label, error, input }) => (
  <div>
    <label className="mb-2 block text-sm font-medium">{label}</label>

    {input}

    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

export default CreateEbookPage;
