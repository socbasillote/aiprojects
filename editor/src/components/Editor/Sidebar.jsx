import { useDispatch, useSelector } from "react-redux";

import {
  selectPage,
  addPage,
  deletePage,
  selectElement,
} from "../../features/editor/editorSlice";

import { selectActivePageElements } from "../../features/editor/editorSelectors";

import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

export default function Sidebar() {
  const dispatch = useDispatch();

  const { pages, activePageId } = useSelector(
    (state) => state.editor.present.document,
  );

  const selectedElementId = useSelector(
    (state) => state.editor.present.selectedElementId,
  );

  const elements = useSelector(selectActivePageElements);

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-white">
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Pages</h2>

          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => dispatch(addPage())}
          >
            +
          </Button>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-3 p-4">
            {pages.map((page, index) => {
              const isActive = page.id === activePageId;

              return (
                <div
                  key={page.id}
                  className={`group cursor-pointer rounded-md border p-2 ${
                    isActive
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-slate-400"
                  }`}
                  onClick={() => dispatch(selectPage(page.id))}
                >
                  <div className="relative flex aspect-[1/1.414] items-center justify-center rounded border bg-slate-50 text-xs text-slate-500">
                    Page {index + 1}
                    {pages.length > 1 && (
                      <button
                        type="button"
                        className="absolute right-1 top-1 hidden h-5 w-5 rounded text-xs hover:bg-slate-200 group-hover:block"
                        onClick={(event) => {
                          event.stopPropagation();

                          dispatch(deletePage(page.id));
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <div className="mt-2 text-center text-xs">
                    Page {index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </section>

      <Separator />

      <section className="flex h-1/2 min-h-0 flex-col">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Layers</h2>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-1 p-2">
            {[...elements].reverse().map((element) => {
              const isSelected = element.id === selectedElementId;

              return (
                <LayerItem
                  key={element.id}
                  element={element}
                  isSelected={isSelected}
                  onSelect={() => dispatch(selectElement(element.id))}
                />
              );
            })}
          </div>
        </ScrollArea>
      </section>
    </aside>
  );
}
function LayerItem({ element, isSelected, onSelect }) {
  const label = getElementLabel(element);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs ${
        isSelected ? "bg-blue-50 text-blue-700" : "hover:bg-slate-100"
      }`}
    >
      <span className="w-5 text-center">{getElementIcon(element)}</span>

      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

function getElementLabel(element) {
  if (element.type === "text") {
    return element.content || "Text";
  }

  if (element.type === "image") {
    return "Image";
  }

  if (element.type === "shape") {
    return element.shape.charAt(0).toUpperCase() + element.shape.slice(1);
  }

  return "Element";
}

function getElementIcon(element) {
  if (element.type === "text") {
    return "T";
  }

  if (element.type === "image") {
    return "▧";
  }

  if (element.type === "shape") {
    return "□";
  }

  return "•";
}
