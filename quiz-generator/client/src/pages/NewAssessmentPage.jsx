import { useNavigate } from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import AssessmentForm from "../features/documents/components/AssessmentForm";

import { createAssessment } from "../features/editor/editorStorage";
import { createInitialAssessmentDocument } from "../features/editor/editorSlice";

export default function NewAssessmentPage() {
  const navigate = useNavigate();

  function handleGenerate(formData) {
    const initialDocument = createInitialAssessmentDocument();

    const assessment = createAssessment({
      ...initialDocument,

      title: formData.title,
    });

    navigate(`/assessments/${assessment.id}/editor`);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">New Assessment</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Create an Assessment
          </h1>

          <p className="mt-2 text-slate-600">
            Configure your assessment before generating questions.
          </p>
        </div>

        <AssessmentForm onGenerate={handleGenerate} />
      </div>
    </AppShell>
  );
}
