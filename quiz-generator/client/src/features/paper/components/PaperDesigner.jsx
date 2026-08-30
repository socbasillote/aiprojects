import PaperSettings from "./PaperSettings";
import PaperPreview from "./PaperPreview";
import PagperExport from "./PaperExport";

import { useRef } from "react";

export default function PaperDesigner() {
  const previewRef = useRef(null);
  return (
    <div className="flex h-screen min-h-0 flex-col bg-slate-100">
      <header className="flex h-10 shrink-0 items-center justify-center border-b border-slate-200 bg-white">
        <h1 className="text-sm font-semibold text-slate-900">Paper Designer</h1>
      </header>

      <PagperExport previewRef={previewRef} />

      <div className="flex min-h-0 flex-1">
        <PaperSettings />

        <PaperPreview previewRef={previewRef} />
      </div>
    </div>
  );
}
