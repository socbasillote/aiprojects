import AppShell from "../components/layout/AppShell";
import AssessmentList from "../features/documents/components/AssessmentList";

export default function AssessmentsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">Assessments</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Your Assessments
          </h1>

          <p className="mt-2 text-slate-600">
            Create and manage your assessments.
          </p>
        </div>

        <AssessmentList />
      </div>
    </AppShell>
  );
}
