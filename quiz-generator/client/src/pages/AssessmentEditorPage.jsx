import { useLocation } from "react-router-dom";

import AppShell from "../components/layout/AppShell";

export default function AssessmentEditorPage() {
  const location = useLocation();

  const assessment = location.state?.assessment;

  return (
    <AppShell>
      <div>
        <p className="text-sm font-medium text-slate-500">Assessment Editor</p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          {assessment?.title || "Untitled Assessment"}
        </h1>

        <pre className="mt-6 overflow-auto rounded-xl bg-slate-900 p-5 text-sm text-white">
          {JSON.stringify(assessment, null, 2)}
        </pre>
      </div>
    </AppShell>
  );
}
