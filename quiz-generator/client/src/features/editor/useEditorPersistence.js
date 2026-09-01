import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { hydrateEditor, selectEditorDocument } from "./editorSlice";

import { loadAssessment, saveAssessment } from "./editorStorage";

export default function useEditorPersistence() {
  const dispatch = useDispatch();

  const { assessmentId } = useParams();

  const document = useSelector(selectEditorDocument);

  const [hydrated, setHydrated] = useState(false);

  const hydratedAssessmentId = useRef(null);

  /*
   * -----------------------------------------------
   * LOAD ASSESSMENT
   * -----------------------------------------------
   */

  useEffect(() => {
    if (!assessmentId) {
      return;
    }

    if (hydratedAssessmentId.current === assessmentId) {
      return;
    }

    setHydrated(false);

    const assessment = loadAssessment(assessmentId);

    if (!assessment) {
      console.warn(
        `Assessment "${assessmentId}" was not found in local storage.`,
      );

      return;
    }

    /*
     * IMPORTANT:
     *
     * assessment.data contains:
     *
     * title
     * questions
     * sections
     * paper
     */
    dispatch(hydrateEditor(assessment.data));

    hydratedAssessmentId.current = assessmentId;

    setHydrated(true);
  }, [assessmentId, dispatch]);

  /*
   * -----------------------------------------------
   * SAVE ASSESSMENT
   * -----------------------------------------------
   */

  useEffect(() => {
    if (!assessmentId) {
      return;
    }

    if (!hydrated) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      saveAssessment(assessmentId, document);
    }, 700);

    return () => {
      window.clearTimeout(timeoutId);

      saveAssessment(assessmentId, document);
    };
  }, [assessmentId, document, hydrated]);
}
