import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  deleteAssessment,
  listAssessments,
  duplicateAssessment,
} from "../../editor/editorStorage";

export default function AssessmentList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("updated");

  const [assessments, setAssessments] = useState([]);

  const [assessmentToDelete, setAssessmentToDelete] = useState(null);

  function loadAssessments() {
    setAssessments(listAssessments());
  }

  useEffect(() => {
    loadAssessments();
  }, []);

  function handleOpen(assessmentId) {
    navigate(`/assessments/${assessmentId}/editor`);
  }

  function handleDeleteClick(event, assessment) {
    event.stopPropagation();

    setAssessmentToDelete(assessment);
  }

  function handleCancelDelete() {
    setAssessmentToDelete(null);
  }

  function handleConfirmDelete() {
    if (!assessmentToDelete) {
      return;
    }

    deleteAssessment(assessmentToDelete.id);

    setAssessmentToDelete(null);

    loadAssessments();
  }

  function handleDuplicate(assessmentId) {
    const duplicate = duplicateAssessment(assessmentId);

    if (!duplicate) {
      return;
    }

    loadAssessments();
  }

  const filteredAssessments = assessments
    .filter((assessment) => {
      const title = assessment.data.title?.trim().toLowerCase() || "";

      return title.includes(search.trim().toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === "title") {
        const titleA = a.data.title?.trim().toLowerCase() || "";

        const titleB = b.data.title?.trim().toLowerCase() || "";

        return titleA.localeCompare(titleB);
      }

      if (sortBy === "created") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  if (assessments.length === 0) {
    return (
      <>
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
      </>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search assessments..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>

          {filteredAssessments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h2 className="text-lg font-semibold text-slate-900">
                No assessments found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Try a different search term.
              </p>
            </div>
          ) : (
            <div className="space-y-3">{/* assessment cards */}</div>
          )}
        </div>
        {filteredAssessments.map((assessment) => {
          const title = assessment.data.title?.trim() || "Untitled Assessment";

          const questionCount = Array.isArray(assessment.data.questions)
            ? assessment.data.questions.length
            : 0;

          const updatedAt = new Date(assessment.updatedAt).toLocaleString();

          return (
            <div
              key={assessment.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => handleOpen(assessment.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <h2 className="truncate text-base font-semibold text-slate-900">
                    {title}
                  </h2>

                  <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                    <span>
                      {questionCount}{" "}
                      {questionCount === 1 ? "question" : "questions"}
                    </span>

                    <span className="text-slate-300">•</span>

                    <span>Updated {updatedAt}</span>
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpen(assessment.id)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Open
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicate(assessment.id)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Duplicate
                  </button>

                  <button
                    type="button"
                    onClick={(event) => handleDeleteClick(event, assessment)}
                    className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DELETE MODAL */}

      {assessmentToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-assessment-title"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div>
              <h2
                id="delete-assessment-title"
                className="text-lg font-semibold text-slate-900"
              >
                Delete assessment?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Are you sure you want to delete{" "}
                <span className="font-medium text-slate-700">
                  {assessmentToDelete.data.title?.trim() ||
                    "Untitled Assessment"}
                </span>
                ?
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                This will permanently remove the assessment and all of its saved
                content from this device.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Delete Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
