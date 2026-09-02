import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { updateTitle } from "../editorSlice";

import ExportMenu from "./ExportMenu";

export default function EditorHeader() {
  const { assessmentId } = useParams();
  const dispatch = useDispatch();
  const title = useSelector((state) => state.editor.title);
  const status = useSelector((state) => state.editor.status);
  const validation = useSelector((state) => state.editor.validation);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Dashboard
        </Link>

        <div className="h-5 w-px bg-slate-200" />

        <div>
          <input
            type="text"
            value={title}
            onChange={(event) => {
              dispatch(updateTitle(event.target.value));
            }}
            placeholder="Untitled Assessment"
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-lg font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
          />

          <p className="text-xs text-slate-400">
            {status === "saved" ? "Saved" : "Unsaved changes"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to={`/assessments/${assessmentId}/paper`}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Design Paper
        </Link>

        <ExportMenu />

        <button
          type="button"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Save
        </button>

        <div className="flex items-center gap-2">
          <span
            className={[
              "rounded-full px-2.5 py-1 text-xs font-medium",
              validation.valid
                ? "bg-slate-100 text-slate-600"
                : "bg-slate-100 text-slate-400",
            ].join(" ")}
          >
            {validation.valid ? "Ready" : "Not checked"}
          </span>

          <span className="text-xs text-slate-400">
            {status === "saved" ? "Saved" : "Unsaved changes"}
          </span>
        </div>
      </div>
    </header>
  );
}
