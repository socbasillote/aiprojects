import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

import EditorHeader from "../features/editor/components/EditorHeader";
import QuestionSidebar from "../features/editor/components/QuestionSidebar";
import EditorCanvas from "../features/editor/components/EditorCanvas";
import PropertiesPanel from "../features/editor/components/PropertiesPanel";
import ValidationPanel from "../features/editor/components/ValidationPanel";

import { hydrateEditor } from "../features/editor/editorSlice";

export default function AssessmentEditorPage() {
  const dispatch = useDispatch();

  const location = useLocation();

  useEffect(() => {
    const assessment = location.state?.assessment;

    if (!assessment) {
      return;
    }

    dispatch(
      hydrateEditor({
        title: assessment.title ?? "",
      }),
    );

    /*
     * Remove the navigation state after
     * initializing the new assessment.
     *
     * This prevents the same assessment
     * configuration from being hydrated again
     * after a remount.
     */
    window.history.replaceState({}, document.title);
  }, [dispatch, location.state]);

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
