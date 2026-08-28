import { Link } from "react-router-dom";

import PaperSettings from "../features/paper/components/PaperSettings";
import PaperPreview from "../features/paper/components/PaperPreview";

export default function PaperDesignerPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
        <Link
          to="/assessments/new/editor"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to Editor
        </Link>

        <h1 className="text-sm font-semibold text-slate-900">Paper Designer</h1>

        <div className="w-28" />
      </header>

      <div className="flex min-h-0 flex-1">
        <PaperSettings />

        <PaperPreview />
      </div>
    </div>
  );
}
