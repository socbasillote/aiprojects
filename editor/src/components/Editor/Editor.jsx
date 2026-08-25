import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import {
  clearSelection,
  deleteElement,
  updateElement,
  duplicateElement,
  bringElementToFront,
  sendElementToBack,
  bringElementForward,
  sendElementBackward,
} from "../../features/editor/editorSlice";

import { undo, redo } from "../../features/editor/historyActions";

import Toolbar from "./Toolbar";
import Sidebar from "./Sidebar";
import PropertiesPanel from "./PropertiesPanel";
import CanvasViewport from "./CanvasViewport";

export default function Editor() {
  const dispatch = useDispatch();

  const selectedElementId = useSelector(
    (state) => state.editor.present.selectedElementId,
  );

  const document = useSelector((state) => state.editor.present.document);

  useEffect(() => {
    function handleKeyDown(event) {
      const target = event.target;

      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (isTyping) {
        return;
      }

      /*
       * Escape
       */
      if (event.key === "Escape") {
        event.preventDefault();

        dispatch(clearSelection());

        return;
      }

      /*
       * Undo / Redo
       *
       * Cmd/Ctrl + Z
       * Cmd/Ctrl + Shift + Z
       */
      const isModifierPressed = event.metaKey || event.ctrlKey;

      if (isModifierPressed && event.key.toLowerCase() === "z") {
        event.preventDefault();

        if (event.shiftKey) {
          dispatch(redo());
        } else {
          dispatch(undo());
        }

        return;
      }

      /*
       * Nothing below this point requires
       * a selected element.
       */
      if (!selectedElementId) {
        return;
      }

      /*
       * Delete
       */
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();

        dispatch(deleteElement(selectedElementId));

        return;
      }

      /*
       * Duplicate
       *
       * Cmd/Ctrl + D
       */
      if (isModifierPressed && event.key.toLowerCase() === "d") {
        event.preventDefault();

        dispatch(duplicateElement(selectedElementId));

        return;
      }

      /*
       * Layer controls
       *
       * We MUST handle these before
       * the arrow-key logic.
       */

      // Cmd/Ctrl + Shift + ]
      // Bring to front
      if (isModifierPressed && event.shiftKey && event.key === "]") {
        event.preventDefault();

        dispatch(bringElementToFront(selectedElementId));

        return;
      }

      // Cmd/Ctrl + Shift + [
      // Send to back
      if (isModifierPressed && event.shiftKey && event.key === "[") {
        event.preventDefault();

        dispatch(sendElementToBack(selectedElementId));

        return;
      }

      // Cmd/Ctrl + ]
      // Bring forward
      if (isModifierPressed && event.key === "]") {
        event.preventDefault();

        dispatch(bringElementForward(selectedElementId));

        return;
      }

      // Cmd/Ctrl + [
      // Send backward
      if (isModifierPressed && event.key === "[") {
        event.preventDefault();

        dispatch(sendElementBackward(selectedElementId));

        return;
      }

      /*
       * Find selected element
       */
      const element = findElement(document, selectedElementId);

      if (!element) {
        return;
      }

      /*
       * Arrow movement
       *
       * Arrow      = 1px
       * Shift+Arrow = 10px
       */
      const isArrowKey = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ].includes(event.key);

      if (!isArrowKey) {
        return;
      }

      event.preventDefault();

      const step = event.shiftKey ? 10 : 1;

      let x = element.x;
      let y = element.y;

      switch (event.key) {
        case "ArrowLeft":
          x -= step;
          break;

        case "ArrowRight":
          x += step;
          break;

        case "ArrowUp":
          y -= step;
          break;

        case "ArrowDown":
          y += step;
          break;

        default:
          return;
      }

      /*
       * Keep element inside page.
       */
      const pageSize = document.settings;

      x = Math.max(0, Math.min(x, pageSize.width - element.width));

      y = Math.max(0, Math.min(y, pageSize.height - element.height));

      /*
       * Keyboard movement is already
       * one atomic operation, so we use
       * the normal history-producing
       * updateElement action.
       */
      dispatch(
        updateElement({
          elementId: selectedElementId,

          changes: {
            x,
            y,
          },
        }),
      );
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, selectedElementId, document]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
      <Toolbar />

      <div className="flex min-h-0 flex-1">
        <Sidebar />

        <main className="min-w-0 flex-1 overflow-hidden">
          <CanvasViewport />
        </main>

        <PropertiesPanel />
      </div>
    </div>
  );
}

function findElement(document, elementId) {
  for (const page of document.pages) {
    const element = page.elements.find((element) => element.id === elementId);

    if (element) {
      return element;
    }
  }

  return null;
}
