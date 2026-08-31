import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { hydrateEditor, selectEditorDocument } from "./editorSlice";

import { loadEditorState, saveEditorState } from "./editorStorage";

export default function useEditorPersistence() {
  const dispatch = useDispatch();

  const document = useSelector(selectEditorDocument);

  const hydratedRef = useRef(false);

  /*
   * Load the saved assessment once.
   */
  useEffect(() => {
    const savedState = loadEditorState();

    if (savedState) {
      dispatch(hydrateEditor(savedState));
    }

    hydratedRef.current = true;
  }, [dispatch]);

  /*
   * Save document changes.
   *
   * The timeout prevents localStorage from
   * being written on every keystroke.
   */
  useEffect(() => {
    if (!hydratedRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      saveEditorState(document);
    }, 700);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [document]);
}
