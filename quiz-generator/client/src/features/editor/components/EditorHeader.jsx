import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function EditorHeader() {
  const title = useSelector((state) => state.editor.title);
  const status = useSelector((state) => state.editor.status);

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
          <h1 className="text-sm font-semibold text-slate-900">{title}</h1>

          <p className="text-xs text-slate-400">
            {status === "saved" ? "Saved" : "Unsaved changes"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Preview
        </button>

        <button
          type="button"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Export
        </button>

        <button
          type="button"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Save
        </button>
      </div>
    </header>
  );
}
