import { useDispatch, useSelector } from "react-redux";

import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

import { addTextElement } from "../../features/editor/editorSlice";
import ImageUploadButton from "./ImageUploadButton";
import ShapeMenu from "./ShapeMenu";
import ZoomControls from "./ZoomControls";

import { undo, redo } from "../../features/editor/historyActions";

import { requestFitViewport } from "../../features/editor/viewportEvents";

export default function Toolbar() {
  const dispatch = useDispatch();

  function handleAddText() {
    dispatch(addTextElement());
  }

  const canUndo = useSelector((state) => state.editor.past.length > 0);

  const canRedo = useSelector((state) => state.editor.future.length > 0);

  return (
    <header className="flex h-14 shrink-0 items-center border-b bg-white px-4">
      <div className="flex items-center gap-2">
        <div className="mr-4 text-sm font-semibold">PDF Designer</div>

        <Button
          variant="outline"
          size="sm"
          disabled={!canUndo}
          onClick={() => dispatch(undo())}
        >
          Undo
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={!canRedo}
          onClick={() => dispatch(redo())}
        >
          Redo
        </Button>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <Button variant="outline" size="sm" onClick={handleAddText}>
          Text
        </Button>

        <ImageUploadButton />

        <ShapeMenu />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={requestFitViewport}>
          Fit
        </Button>
        <ZoomControls />

        <Button size="sm">Download PDF</Button>
      </div>
    </header>
  );
}
