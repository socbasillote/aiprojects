import { Link } from "react-router-dom";

export default function PreviewHeader({ title, current, total }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <Link
        to="/dashboard"
        className="text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        ← Exit Preview
      </Link>

      <div className="text-center">
        <h1 className="text-sm font-semibold text-slate-900">{title}</h1>

        <p className="text-xs text-slate-400">
          Question {current} of {total}
        </p>
      </div>

      <div className="w-24" />
    </header>
  );
}
