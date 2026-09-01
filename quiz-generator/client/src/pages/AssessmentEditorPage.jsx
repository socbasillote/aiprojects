import EditorHeader from "../features/editor/components/EditorHeader";
import QuestionSidebar from "../features/editor/components/QuestionSidebar";
import EditorCanvas from "../features/editor/components/EditorCanvas";
import PropertiesPanel from "../features/editor/components/PropertiesPanel";
import ValidationPanel from "../features/editor/components/ValidationPanel";

import useEditorPersistence from "../features/editor/useEditorPersistence";

export default function AssessmentEditorPage() {
  useEditorPersistence();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <EditorHeader />

      <ValidationPanel />

      <div className="flex min-h-0 flex-1">
        <QuestionSidebar />

        <EditorCanvas />

        <PropertiesPanel />
      </div>
    </div>
  );
}
