import { Link } from "react-router-dom";

export default function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <span className="text-sm text-slate-500">Quiz Builder</span>
      </div>

      <Link
        to="/assessments/new"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        + New Assessment
      </Link>
    </header>
  );
}
