import { useDispatch, useSelector } from "react-redux";

import { useEffect, useRef, useState } from "react";

import {
  selectElement,
  previewMoveElement,
  previewResizeElement,
  commitMoveElement,
  commitResizeElement,
  updateElementContent,
} from "../../features/editor/editorSlice";

import { screenToDocument } from "../../features/editor/viewport";
import { useViewport } from "../../features/editor/ViewportContext";
import { snapElementPosition } from "../../features/editor/snapping";

const MIN_WIDTH = 40;
const MIN_HEIGHT = 30;

const HANDLE_SIZE = 8;

const handles = [
  {
    position: "top-left",
    className: "-left-1 -top-1 cursor-nwse-resize",
  },
  {
    position: "top",
    className: "left-1/2 -top-1 -translate-x-1/2 cursor-ns-resize",
  },
  {
    position: "top-right",
    className: "-right-1 -top-1 cursor-nesw-resize",
  },
  {
    position: "right",
    className: "-right-1 top-1/2 -translate-y-1/2 cursor-ew-resize",
  },
  {
    position: "bottom-right",
    className: "-bottom-1 -right-1 cursor-nwse-resize",
  },
  {
    position: "bottom",
    className: "-bottom-1 left-1/2 -translate-x-1/2 cursor-ns-resize",
  },
  {
    position: "bottom-left",
    className: "-bottom-1 -left-1 cursor-nesw-resize",
  },
  {
    position: "left",
    className: "-left-1 top-1/2 -translate-y-1/2 cursor-ew-resize",
  },
];

export default function CanvasElement({ element }) {
  const dispatch = useDispatch();

  const editorPresent = useSelector((state) => state.editor.present);

  const selectedElementId = useSelector(
    (state) => state.editor.present.selectedElementId,
  );

  const pageSize = useSelector(
    (state) => state.editor.present.document.settings,
  );
  const pages = useSelector((state) => state.editor.present.document.pages);

  const activePageId = useSelector(
    (state) => state.editor.present.document.activePageId,
  );

  const page = pages.find((page) => page.id === activePageId);
  const otherElements = page?.elements ?? [];

  const { containerRef, viewport, setSnapGuides } = useViewport();

  const isSelected = selectedElementId === element.id;

  const [isEditing, setIsEditing] = useState(false);

  const [draftContent, setDraftContent] = useState(element.content);

  const dragRef = useRef(null);

  const resizeRef = useRef(null);

  const textareaRef = useRef(null);

  useEffect(() => {
    setDraftContent(element.content);
  }, [element.content]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    requestAnimationFrame(() => {
      textareaRef.current?.focus();

      textareaRef.current?.select();
    });
  }, [isEditing]);

  /*
   * -----------------------------
   * Drag
   * -----------------------------
   */

  function handlePointerDown(event) {
    event.stopPropagation();

    if (isEditing) {
      return;
    }

    dispatch(selectElement(element.id));

    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const startPoint = screenToDocument({
      clientX: event.clientX,
      clientY: event.clientY,

      rect,

      zoom: viewport.zoom,

      panX: viewport.panX,
      panY: viewport.panY,
    });

    dragRef.current = {
      pointerId: event.pointerId,

      startPointerDocumentX: startPoint.x,

      startPointerDocumentY: startPoint.y,

      startElementX: element.x,

      startElementY: element.y,

      before: structuredClone(editorPresent),
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;

    if (!drag || isEditing) {
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const currentPoint = screenToDocument({
      clientX: event.clientX,
      clientY: event.clientY,

      rect,

      zoom: viewport.zoom,

      panX: viewport.panX,
      panY: viewport.panY,
    });

    const deltaX = currentPoint.x - drag.startPointerDocumentX;

    const deltaY = currentPoint.y - drag.startPointerDocumentY;

    const proposedX = Math.max(
      0,
      Math.min(drag.startElementX + deltaX, pageSize.width - element.width),
    );

    const proposedY = Math.max(
      0,
      Math.min(drag.startElementY + deltaY, pageSize.height - element.height),
    );

    const page = {
      width: pageSize.width,
      height: pageSize.height,
    };

    const snapped = event.altKey
      ? {
          x: proposedX,
          y: proposedY,
          guides: [],
        }
      : snapElementPosition({
          element,
          proposedX,
          proposedY,
          page,

          otherElements: page?.elements ?? [],
        });

    setSnapGuides(snapped.guides);

    const nextX = Math.max(
      0,
      Math.min(snapped.x, pageSize.width - element.width),
    );

    const nextY = Math.max(
      0,
      Math.min(snapped.y, pageSize.height - element.height),
    );

    dispatch(
      previewMoveElement({
        elementId: element.id,

        x: nextX,

        y: nextY,
      }),
    );
  }

  function handlePointerUp(event) {
    const drag = dragRef.current;

    if (!drag) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(drag.pointerId)) {
      event.currentTarget.releasePointerCapture(drag.pointerId);
    }

    setSnapGuides([]);

    dispatch(
      commitMoveElement({
        before: drag.before,
      }),
    );

    dragRef.current = null;
  }

  function handlePointerCancel(event) {
    setSnapGuides([]);

    handlePointerUp(event);
  }

  /*
   * -----------------------------
   * Selection
   * -----------------------------
   */

  function handleClick(event) {
    event.stopPropagation();

    if (!isSelected) {
      dispatch(selectElement(element.id));
    }
  }

  /*
   * -----------------------------
   * Text editing
   * -----------------------------
   */

  function handleDoubleClick(event) {
    event.stopPropagation();

    if (element.type !== "text") {
      return;
    }

    setDraftContent(element.content);

    setIsEditing(true);
  }

  function commitText() {
    dispatch(
      updateElementContent({
        elementId: element.id,

        content: draftContent,
      }),
    );

    setIsEditing(false);
  }

  function handleTextKeyDown(event) {
    if (event.key === "Escape") {
      setDraftContent(element.content);

      setIsEditing(false);

      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      commitText();
    }
  }

  /*
   * -----------------------------
   * Resize
   * -----------------------------
   */

  function handleResizeStart(event, position) {
    event.stopPropagation();

    dispatch(selectElement(element.id));

    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const startPoint = screenToDocument({
      clientX: event.clientX,
      clientY: event.clientY,

      rect,

      zoom: viewport.zoom,

      panX: viewport.panX,
      panY: viewport.panY,
    });

    resizeRef.current = {
      pointerId: event.pointerId,

      position,

      startPointerDocumentX: startPoint.x,

      startPointerDocumentY: startPoint.y,

      startX: element.x,

      startY: element.y,

      startWidth: element.width,

      startHeight: element.height,

      before: structuredClone(editorPresent),
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleResizeMove(event) {
    const resize = resizeRef.current;

    if (!resize) {
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const currentPoint = screenToDocument({
      clientX: event.clientX,
      clientY: event.clientY,

      rect,

      zoom: viewport.zoom,

      panX: viewport.panX,
      panY: viewport.panY,
    });

    const deltaX = currentPoint.x - resize.startPointerDocumentX;

    const deltaY = currentPoint.y - resize.startPointerDocumentY;

    let x = resize.startX;

    let y = resize.startY;

    let width = resize.startWidth;

    let height = resize.startHeight;

    if (resize.position.includes("right")) {
      width = resize.startWidth + deltaX;
    }

    if (resize.position.includes("left")) {
      width = resize.startWidth - deltaX;

      x = resize.startX + deltaX;
    }

    if (resize.position.includes("bottom")) {
      height = resize.startHeight + deltaY;
    }

    if (resize.position.includes("top")) {
      height = resize.startHeight - deltaY;

      y = resize.startY + deltaY;
    }

    /*
     * Minimum dimensions.
     */
    width = Math.max(MIN_WIDTH, width);

    height = Math.max(MIN_HEIGHT, height);

    /*
     * Keep the element inside
     * the left/top page bounds.
     */
    if (x < 0) {
      width += x;
      x = 0;
    }

    if (y < 0) {
      height += y;
      y = 0;
    }

    /*
     * Keep the element inside
     * the right/bottom page bounds.
     */
    if (x + width > pageSize.width) {
      width = pageSize.width - x;
    }

    if (y + height > pageSize.height) {
      height = pageSize.height - y;
    }

    /*
     * Re-check minimum dimensions
     * after page-bound clamping.
     */
    width = Math.max(MIN_WIDTH, width);

    height = Math.max(MIN_HEIGHT, height);

    dispatch(
      previewResizeElement({
        elementId: element.id,

        x,

        y,

        width,

        height,
      }),
    );
  }

  function handleResizeEnd(event) {
    const resize = resizeRef.current;

    if (!resize) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(resize.pointerId)) {
      event.currentTarget.releasePointerCapture(resize.pointerId);
    }

    dispatch(
      commitResizeElement({
        before: resize.before,
      }),
    );

    resizeRef.current = null;
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`absolute select-none ${
        isSelected ? "outline outline-2 outline-blue-500" : ""
      }`}
      style={{
        left: element.x,

        top: element.y,

        width: element.width,

        height: element.height,

        transform: `rotate(${element.rotation}deg)`,
      }}
    >
      {element.type === "text" && (
        <>
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
              onBlur={commitText}
              onKeyDown={handleTextKeyDown}
              className="h-full w-full resize-none overflow-hidden border-none bg-transparent p-0 outline-none"
              style={{
                fontSize: element.style.fontSize,
                fontFamily: element.style.fontFamily,
                fontWeight: element.style.fontWeight,
                color: element.style.color,
                textAlign: element.style.textAlign,

                lineHeight: element.style.lineHeight ?? 1.2,
              }}
            />
          ) : (
            <div
              className="h-full w-full overflow-hidden"
              style={{
                fontSize: element.style.fontSize,
                fontFamily: element.style.fontFamily,
                fontWeight: element.style.fontWeight,
                color: element.style.color,
                textAlign: element.style.textAlign,

                lineHeight: element.style.lineHeight ?? 1.2,
              }}
            >
              {element.content}
            </div>
          )}
        </>
      )}

      {element.type === "image" && (
        <img
          src={element.src}
          alt=""
          draggable={false}
          className="h-full w-full object-fill"
        />
      )}

      {element.type === "shape" && (
        <div
          className="h-full w-full"
          style={{
            backgroundColor: element.style.fill,

            borderColor: element.style.borderColor,

            borderWidth: element.style.borderWidth,

            borderStyle: "solid",

            borderRadius:
              element.shape === "circle" ? "50%" : element.style.borderRadius,
          }}
        />
      )}

      {isSelected &&
        !isEditing &&
        handles.map((handle) => (
          <div
            key={handle.position}
            onPointerDown={(event) => handleResizeStart(event, handle.position)}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeEnd}
            onPointerCancel={handleResizeEnd}
            onClick={(event) => event.stopPropagation()}
            className={`absolute z-10 rounded-sm border border-blue-500 bg-white ${handle.className}`}
            style={{
              width: HANDLE_SIZE,

              height: HANDLE_SIZE,
            }}
          />
        ))}
    </div>
  );
}
