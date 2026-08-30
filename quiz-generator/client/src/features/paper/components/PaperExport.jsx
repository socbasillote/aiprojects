import { useState } from "react";
import { useSelector } from "react-redux";

import { exportPaperAsPdf, exportPaperAsPng } from "../paperExport";

export default function PaperExport({ previewRef }) {
  const title = useSelector((state) => state.editor.title);

  const paper = useSelector((state) => state.editor.paper);

  const [exporting, setExporting] = useState(false);

  const [error, setError] = useState("");

  async function handleExport(type) {
    if (exporting) {
      return;
    }

    if (!previewRef?.current) {
      setError("Paper preview is not ready.");
      return;
    }

    setExporting(true);
    setError("");

    try {
      const filename =
        title
          ?.trim()
          .replace(/[^a-z0-9]+/gi, "-")
          .replace(/^-|-$/g, "") || "assessment";

      if (type === "pdf") {
        await exportPaperAsPdf({
          previewElement: previewRef.current,
          pageSize: paper.pageSize,
          orientation: paper.orientation,
          filename,
        });
      }

      if (type === "png") {
        await exportPaperAsPng({
          previewElement: previewRef.current,
          filename,
        });
      }
    } catch (exportError) {
      console.error("Paper export failed:", exportError);

      setError(exportError?.message || "Unable to export the assessment.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Export</h2>

          <p className="text-xs text-slate-400">
            Export the paper exactly as displayed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={exporting}
            onClick={() => handleExport("pdf")}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export PDF"}
          </button>

          <button
            type="button"
            disabled={exporting}
            onClick={() => handleExport("png")}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export PNG
          </button>
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
