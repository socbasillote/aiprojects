import { useState } from "react";
import {
  questionTypes,
  difficultyOptions,
} from "../../../data/mock/assessmentOptions";

const initialForm = {
  title: "",
  subject: "",
  gradeLevel: "",
  topic: "",
  questionCount: 10,
  questionTypes: ["multiple_choice"],
  difficulty: "medium",
  language: "English",
  instructions: "",
};

export default function AssessmentForm({ onGenerate, submitting = false }) {
  const [form, setForm] = useState(initialForm);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleQuestionTypeChange(type) {
    setForm((current) => {
      const exists = current.questionTypes.includes(type);

      return {
        ...current,
        questionTypes: exists
          ? current.questionTypes.filter((item) => item !== type)
          : [...current.questionTypes, type],
      };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    onGenerate(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Assessment Details
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Tell us what you want your assessment to cover.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Assessment Title
            </label>

            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Grade 8 Photosynthesis Quiz"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              required
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Subject
              </label>

              <input
                id="subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Science"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                required
              />
            </div>

            <div>
              <label
                htmlFor="gradeLevel"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Grade Level
              </label>

              <input
                id="gradeLevel"
                name="gradeLevel"
                value={form.gradeLevel}
                onChange={handleChange}
                placeholder="8"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="topic"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Topic
            </label>

            <input
              id="topic"
              name="topic"
              value={form.topic}
              onChange={handleChange}
              placeholder="Photosynthesis"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              required
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Question Settings
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Configure the questions you want to generate.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="questionCount"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Number of Questions
            </label>

            <input
              id="questionCount"
              name="questionCount"
              type="number"
              min="1"
              max="100"
              value={form.questionCount}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <fieldset>
            <legend className="mb-3 text-sm font-medium text-slate-700">
              Question Types
            </legend>

            <div className="grid gap-3 sm:grid-cols-2">
              {questionTypes.map((type) => {
                const checked = form.questionTypes.includes(type.value);

                return (
                  <label
                    key={type.value}
                    className={[
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition",
                      checked
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 hover:border-slate-300",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleQuestionTypeChange(type.value)}
                      className="h-4 w-4"
                    />

                    <span className="text-sm font-medium text-slate-700">
                      {type.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="difficulty"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Difficulty
            </label>

            <select
              id="difficulty"
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              {difficultyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="language"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Language
            </label>

            <input
              id="language"
              name="language"
              value={form.language}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label
              htmlFor="instructions"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Additional Instructions
            </label>

            <textarea
              id="instructions"
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              rows={4}
              placeholder="For example: Focus on the light-dependent reactions."
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={form.questionTypes.length === 0 || submitting}
          className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Generating..." : "Generate Questions"}
        </button>
      </div>
    </form>
  );
}
