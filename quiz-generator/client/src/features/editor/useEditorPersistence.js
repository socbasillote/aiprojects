import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { hydrateEditor, selectEditorDocument, setStatus } from "./editorSlice";

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

    dispatch(hydrateEditor(assessment.data));

    hydratedAssessmentId.current = assessmentId;

    setHydrated(true);
  }, [assessmentId, dispatch]);

  /*
   * -----------------------------------------------
   * AUTO SAVE
   * -----------------------------------------------
   */

  useEffect(() => {
    if (!assessmentId || !hydrated) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const saved = saveAssessment(assessmentId, document);

      if (saved) {
        dispatch(setStatus("saved"));
      }
    }, 700);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [assessmentId, document, hydrated, dispatch]);

  /*
   * -----------------------------------------------
   * MANUAL SAVE
   * -----------------------------------------------
   */

  const saveNow = useCallback(() => {
    if (!assessmentId || !hydrated) {
      return false;
    }

    const saved = saveAssessment(assessmentId, document);

    if (saved) {
      dispatch(setStatus("saved"));
    }

    return saved;
  }, [assessmentId, document, hydrated, dispatch]);

  return {
    saveNow,
    hydrated,
  };
}
