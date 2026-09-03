import { useRef, useState } from "react";
import { useDispatch } from "react-redux";

import PaperSettings from "./PaperSettings";
import PaperPreview from "./PaperPreview";
import PagperExport from "./PaperExport";
import PaperDocumentTree from "./PaperDocumentTree";

import useEditorPersistence from "../../editor/useEditorPersistence";
import { selectQuestion } from "../../editor/editorSlice";

export default function PaperDesigner() {
  const dispatch = useDispatch();
  useEditorPersistence();

  const previewRef = useRef(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

  function handleWorkspaceClick(event) {
    if (
      !event.target.closest("[data-paper-preview]") &&
      !event.target.closest("[data-paper-question]")
    ) {
      dispatch(selectQuestion(null));
    }
  }

  return (
    <div
      className="flex h-screen min-h-0 flex-col bg-slate-100"
      onClick={handleWorkspaceClick}
    >
      {/* HEADER */}

      <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <h1 className="text-sm font-semibold text-slate-900">Paper Designer</h1>

        <PagperExport previewRef={previewRef} />
      </header>

      {/* WORKSPACE */}

      <div className="flex min-h-0 flex-1">
        {/* LEFT SIDEBAR */}

        <PaperDocumentTree />

        {/* CENTER PAPER PREVIEW */}

        <PaperPreview previewRef={previewRef} />

        {/* RIGHT SETTINGS */}

        <PaperSettings
          isOpen={isSettingsOpen}
          onToggle={() => setIsSettingsOpen((open) => !open)}
        />
      </div>
    </div>
  );
}
