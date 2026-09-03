import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { hydrateEditor, selectEditorDocument, setStatus } from "./editorSlice";

import {
  getAssessment,
  normalizeAssessment,
  updateAssessment,
} from "../../api/assessmentApi";

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

    let cancelled = false;

    getAssessment(assessmentId)
      .then((assessment) => {
        if (cancelled) {
          return;
        }

        dispatch(hydrateEditor(normalizeAssessment(assessment)));

        hydratedAssessmentId.current = assessmentId;

        setHydrated(true);
      })
      .catch((error) => {
        console.error("Failed to load assessment:", error);
      });

    return () => {
      cancelled = true;
    };
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
      updateAssessment(assessmentId, document)
        .then(() => dispatch(setStatus("saved")))
        .catch((error) => console.error("Failed to save assessment:", error));
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

    return updateAssessment(assessmentId, document)
      .then(() => {
        dispatch(setStatus("saved"));
        return true;
      })
      .catch((error) => {
        console.error("Failed to save assessment:", error);
        return false;
      });
  }, [assessmentId, document, hydrated, dispatch]);

  return {
    saveNow,
    hydrated,
  };
}
