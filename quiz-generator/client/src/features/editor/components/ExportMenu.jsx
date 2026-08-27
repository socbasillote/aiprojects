import { useState } from "react";
import { useSelector } from "react-redux";

import { buildAssessmentExport, downloadJSON } from "../export";

export default function ExportMenu() {
  const [open, setOpen] = useState(false);

  const title = useSelector((state) => state.editor.title);

  const description = useSelector((state) => state.editor.description);

  const questions = useSelector((state) => state.editor.questions);

  const validation = useSelector((state) => state.editor.validation);

  function getExportData() {
    return buildAssessmentExport({
      title,
      description,
      questions,
    });
  }

  function handleJSONExport() {
    const data = getExportData();

    downloadJSON(data, `${title || "assessment"}.json`);

    setOpen(false);
  }

  function handlePrint() {
    setOpen(false);

    window.print();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Export
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close export menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
            <button
              type="button"
              onClick={handleJSONExport}
              className="w-full rounded-lg px-3 py-2.5 text-left hover:bg-slate-50"
            >
              <span className="block text-sm font-medium text-slate-700">
                Export JSON
              </span>

              <span className="mt-0.5 block text-xs text-slate-400">
                Download assessment data
              </span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="w-full rounded-lg px-3 py-2.5 text-left hover:bg-slate-50"
            >
              <span className="block text-sm font-medium text-slate-700">
                Print Assessment
              </span>

              <span className="mt-0.5 block text-xs text-slate-400">
                Open print preview
              </span>
            </button>

            {!validation.valid && (
              <div className="mt-1 border-t border-slate-100 px-3 py-2">
                <p className="text-xs text-amber-600">
                  Assessment has validation issues.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
