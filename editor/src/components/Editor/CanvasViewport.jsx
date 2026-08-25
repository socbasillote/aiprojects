import { useCallback, useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { setViewport } from "../../features/editor/editorSlice";

import Canvas from "./Canvas";

import { FIT_VIEWPORT_EVENT } from "../../features/editor/viewportEvents";

import { ViewportProvider } from "../../features/editor/ViewportContext";

export default function CanvasViewport() {
  const dispatch = useDispatch();

  const viewport = useSelector((state) => state.editor.present.viewport);

  const document = useSelector((state) => state.editor.present.document);

  const containerRef = useRef(null);

  const panRef = useRef(null);

  const [isPanning, setIsPanning] = useState(false);
  const [snapGuides, setSnapGuides] = useState([]);

  const [viewportSize, setViewportSize] = useState({
    width: 0,
    height: 0,
  });

  /*
   * Measure the actual viewport.
   */
  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    function updateSize() {
      setViewportSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    }

    updateSize();

    const observer = new ResizeObserver(updateSize);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * Pan
   *
   * Middle mouse or Shift + drag.
   */
  function handlePointerDown(event) {
    const shouldPan = event.button === 1 || event.shiftKey;

    if (!shouldPan) {
      return;
    }

    event.preventDefault();

    panRef.current = {
      pointerId: event.pointerId,

      startPointerX: event.clientX,

      startPointerY: event.clientY,

      startPanX: viewport.panX,

      startPanY: viewport.panY,

      zoom: viewport.zoom,
    };

    setIsPanning(true);

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    const pan = panRef.current;

    if (!pan) {
      return;
    }

    /*
     * Use the values captured during
     * pointerdown.
     *
     * Do not read viewport.panX/panY
     * from the current render here.
     */
    const deltaX = event.clientX - pan.startPointerX;

    const deltaY = event.clientY - pan.startPointerY;

    dispatch(
      setViewport({
        zoom: pan.zoom,

        panX: pan.startPanX + deltaX,

        panY: pan.startPanY + deltaY,
      }),
    );
  }

  function handlePointerUp(event) {
    const pan = panRef.current;

    if (!pan) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(pan.pointerId)) {
      event.currentTarget.releasePointerCapture(pan.pointerId);
    }

    panRef.current = null;

    setIsPanning(false);
  }

  /*
   * Fit document into the actual viewport.
   */
  const fitToScreen = useCallback(() => {
    if (viewportSize.width <= 0 || viewportSize.height <= 0) {
      return;
    }

    const pageWidth = document.settings.width;

    const pageHeight = document.settings.height;

    const padding = 96;

    const availableWidth = Math.max(1, viewportSize.width - padding);

    const availableHeight = Math.max(1, viewportSize.height - padding);

    const widthZoom = availableWidth / pageWidth;

    const heightZoom = availableHeight / pageHeight;

    /*
     * Don't automatically zoom beyond 100%
     * when fitting.
     */
    const zoom = Math.min(widthZoom, heightZoom, 1);

    dispatch(
      setViewport({
        zoom: Math.max(0.25, zoom),

        panX: 0,
        panY: 0,
      }),
    );
  }, [
    dispatch,
    document.settings.width,
    document.settings.height,
    viewportSize.width,
    viewportSize.height,
  ]);

  /*
   * Listen for the global "fit viewport"
   * request from the Toolbar.
   */
  useEffect(() => {
    function handleFit() {
      fitToScreen();
    }

    window.addEventListener(FIT_VIEWPORT_EVENT, handleFit);

    return () => {
      window.removeEventListener(FIT_VIEWPORT_EVENT, handleFit);
    };
  }, [fitToScreen]);

  return (
    <ViewportProvider
      value={{
        containerRef,
        viewport,
        viewportSize,
        snapGuides,
        setSnapGuides,
      }}
    >
      <div
        ref={containerRef}
        className={`relative h-full w-full overflow-hidden ${
          isPanning ? "cursor-grabbing" : ""
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <Canvas />
      </div>
    </ViewportProvider>
  );
}
