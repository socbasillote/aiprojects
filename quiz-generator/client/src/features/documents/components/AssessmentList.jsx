import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { listAssessments } from "../../../api/assessmentApi";

export default function AssessmentList() {
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAssessments() {
    try {
      setLoading(true);
      setError("");

      const data = await listAssessments();

      setAssessments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load assessments:", error);

      setError(error.message || "Failed to load assessments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    listAssessments()
      .then((data) => {
        if (active) {
          setAssessments(Array.isArray(data) ? data : []);
        }
      })
      .catch((error) => {
        if (active) {
          setError(error.message || "Failed to load assessments.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">Loading assessments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">{error}</p>

        <button
          type="button"
          onClick={loadAssessments}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h2 className="text-lg font-semibold text-slate-900">
          No assessments yet
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Create your first assessment to get started.
        </p>

        <button
          type="button"
          onClick={() => navigate("/assessments/new")}
          className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Create Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assessments.map((assessment) => {
        const questionCount = Array.isArray(assessment.questions)
          ? assessment.questions.length
          : 0;

        const updatedAt = assessment.updatedAt
          ? new Date(assessment.updatedAt).toLocaleString()
          : "";

        return (
          <button
            key={assessment._id}
            type="button"
            onClick={() => navigate(`/assessments/${assessment._id}/paper`)}
            className="block w-full rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-slate-900">
                  {assessment.title || "Untitled Assessment"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {questionCount}{" "}
                  {questionCount === 1 ? "question" : "questions"}
                </p>
              </div>

              <span className="shrink-0 text-xs text-slate-400">
                {updatedAt}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
