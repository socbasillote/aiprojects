import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import AssessmentForm from "../features/documents/components/AssessmentForm";
import { createAssessment, generateQuestions } from "../api/assessmentApi";
import { createInitialAssessmentDocument } from "../features/editor/editorSlice";

export default function NewAssessmentPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleGenerate(formData) {
    try {
      setSubmitting(true);
      setError("");

      const assessment = await createAssessment({
        ...createInitialAssessmentDocument(),
        title: formData.title,
      });

      await generateQuestions(assessment._id, {
        ...formData,
        questionCount: Number(formData.questionCount),
      });

      navigate(`/assessments/${assessment._id}/editor`);
    } catch (requestError) {
      console.error("Failed to create assessment:", requestError);
      setError(requestError.message || "Failed to create assessment.");
    } finally {
      setSubmitting(false);
    }
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

        {error && (
          <p className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        <AssessmentForm onGenerate={handleGenerate} submitting={submitting} />
      </div>
    </AppShell>
  );
}
