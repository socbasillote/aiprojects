import { useDispatch, useSelector } from "react-redux";

import { setViewport } from "../../features/editor/editorSlice";

import { Button } from "../ui/button";

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

export default function ZoomControls() {
  const dispatch = useDispatch();

  const viewport = useSelector((state) => state.editor.present.viewport);

  function setZoomLevel(zoom) {
    dispatch(
      setViewport({
        ...viewport,
        zoom,
      }),
    );
  }

  function zoomOut() {
    const currentIndex = ZOOM_LEVELS.indexOf(viewport.zoom);

    const nextIndex = currentIndex === -1 ? 0 : Math.max(0, currentIndex - 1);

    setZoomLevel(ZOOM_LEVELS[nextIndex]);
  }

  function zoomIn() {
    const currentIndex = ZOOM_LEVELS.indexOf(viewport.zoom);

    const nextIndex =
      currentIndex === -1
        ? 0
        : Math.min(ZOOM_LEVELS.length - 1, currentIndex + 1);

    setZoomLevel(ZOOM_LEVELS[nextIndex]);
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={zoomOut}
      >
        −
      </Button>

      <button type="button" className="w-14 text-center text-xs">
        {Math.round(viewport.zoom * 100)}%
      </button>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={zoomIn}
      >
        +
      </Button>
    </div>
  );
}
