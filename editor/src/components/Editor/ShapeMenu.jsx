import { useDispatch } from "react-redux";

import { addShapeElement } from "../../features/editor/editorSlice";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function ShapeMenu() {
  const dispatch = useDispatch();

  function addShape(shape) {
    dispatch(
      addShapeElement({
        shape,
      }),
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground">
        Shape
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => addShape("rectangle")}>
          Rectangle
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => addShape("circle")}>
          Circle
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
