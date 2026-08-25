import { useDispatch, useSelector } from "react-redux";

import { clearSelection } from "../../features/editor/editorSlice";

import { selectActivePage } from "../../features/editor/editorSelectors";

import CanvasElement from "./CanvasElement";
import SnapGuides from "./SnapGuides";

import { useViewport } from "../../features/editor/ViewportContext";

export default function Canvas() {
  const document = useSelector((state) => state.editor.present.document);

  const viewport = useSelector((state) => state.editor.present.viewport);
  const { snapGuides } = useViewport();

  const page = useSelector(selectActivePage);

  if (!page) {
    return null;
  }

  const { zoom, panX, panY } = viewport;

  return (
    <div className="relative h-full w-full overflow-auto bg-slate-100">
      <div
        className="relative flex min-h-full min-w-full items-start justify-center"
        style={{
          padding: 48,
        }}
      >
        <div
          className="relative"
          style={{
            transform: `translate(${panX}px, ${panY}px)`,
          }}
        >
          <div
            className="relative shrink-0 shadow-xl"
            style={{
              width: document.settings.width * zoom,

              height: document.settings.height * zoom,

              background: document.settings.background,
            }}
          >
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{
                width: document.settings.width,

                height: document.settings.height,

                transform: `scale(${zoom})`,
              }}
            >
              <SnapGuides
                guides={snapGuides}
                pageWidth={document.settings.width}
                pageHeight={document.settings.height}
              />
              {page.elements.map((element) => (
                <CanvasElement key={element.id} element={element} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
