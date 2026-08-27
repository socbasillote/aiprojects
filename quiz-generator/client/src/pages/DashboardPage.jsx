import { Link } from "react-router-dom";
import AppShell from "../components/layout/AppShell";

const assessments = [
  {
    id: 1,
    title: "Grade 8 Photosynthesis Quiz",
    subject: "Science",
    questions: 20,
    updated: "2 hours ago",
  },
  {
    id: 2,
    title: "Algebra Practice Worksheet",
    subject: "Mathematics",
    questions: 15,
    updated: "Yesterday",
  },
  {
    id: 3,
    title: "Cell Biology Assessment",
    subject: "Biology",
    questions: 25,
    updated: "3 days ago",
  },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <section>
          <p className="text-sm font-medium text-slate-500">
            Assessment workspace
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Create, edit, and organize your assessments.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Link
            to="/assessments/new"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-xl text-white">
              +
            </div>

            <h2 className="mt-4 font-semibold text-slate-900">
              New Assessment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Generate a new quiz or worksheet.
            </p>
          </Link>

          <Link
            to="/question-bank"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xl">
              ?
            </div>

            <h2 className="mt-4 font-semibold text-slate-900">Question Bank</h2>

            <p className="mt-1 text-sm text-slate-500">
              Browse and reuse your questions.
            </p>
          </Link>

          <Link
            to="/templates"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xl">
              ◇
            </div>

            <h2 className="mt-4 font-semibold text-slate-900">Templates</h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose an assessment design.
            </p>
          </Link>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Assessments
              </h2>

              <p className="text-sm text-slate-500">
                Continue working on your assessments.
              </p>
            </div>

            <button
              type="button"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              View all
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {assessments.map((assessment, index) => (
              <div
                key={assessment.id}
                className={[
                  "flex items-center justify-between p-5",
                  index !== assessments.length - 1
                    ? "border-b border-slate-200"
                    : "",
                ].join(" ")}
              >
                <div>
                  <h3 className="font-medium text-slate-900">
                    {assessment.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {assessment.subject} · {assessment.questions} questions
                  </p>
                </div>

                <span className="text-sm text-slate-400">
                  {assessment.updated}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
