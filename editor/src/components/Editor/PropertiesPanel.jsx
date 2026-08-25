import { useDispatch, useSelector } from "react-redux";

import {
  updateElement,
  bringElementToFront,
  bringElementForward,
  sendElementBackward,
  sendElementToBack,
} from "../../features/editor/editorSlice";

import { selectSelectedElement } from "../../features/editor/editorSelectors";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";

export default function PropertiesPanel() {
  const dispatch = useDispatch();

  const element = useSelector(selectSelectedElement);

  if (!element) {
    return (
      <aside className="w-64 shrink-0 border-l bg-white">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Properties</h2>
        </div>

        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            Select an element to edit its properties.
          </p>
        </div>
      </aside>
    );
  }

  function update(changes) {
    dispatch(
      updateElement({
        elementId: element.id,
        changes,
      }),
    );
  }

  function updateStyle(changes) {
    update({
      style: {
        ...element.style,
        ...changes,
      },
    });
  }

  return (
    <aside className="w-64 shrink-0 border-l bg-white">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Properties</h2>
      </div>

      <div className="h-[calc(100vh-3.5rem)] overflow-y-auto">
        <div className="space-y-6 p-4">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Layers
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(bringElementToFront(element.id))}
              >
                To Front
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(sendElementToBack(element.id))}
              >
                To Back
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(bringElementForward(element.id))}
              >
                Forward
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(sendElementBackward(element.id))}
              >
                Backward
              </Button>
            </div>
          </section>
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Position
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <PropertyInput
                label="X"
                value={element.x}
                onChange={(value) =>
                  update({
                    x: value,
                  })
                }
              />

              <PropertyInput
                label="Y"
                value={element.y}
                onChange={(value) =>
                  update({
                    y: value,
                  })
                }
              />
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Size
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <PropertyInput
                label="Width"
                value={element.width}
                onChange={(value) =>
                  update({
                    width: Math.max(40, value),
                  })
                }
              />

              <PropertyInput
                label="Height"
                value={element.height}
                onChange={(value) =>
                  update({
                    height: Math.max(30, value),
                  })
                }
              />
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Transform
            </h3>

            <PropertyInput
              label="Rotation"
              value={element.rotation}
              onChange={(value) =>
                update({
                  rotation: value,
                })
              }
            />
          </section>

          {element.type === "text" && (
            <>
              <Separator />

              <section className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Typography
                </h3>

                <div className="space-y-2">
                  <Label>Font Family</Label>

                  <Input
                    value={element.style.fontFamily}
                    onChange={(event) =>
                      updateStyle({
                        fontFamily: event.target.value,
                      })
                    }
                  />
                </div>

                <PropertyInput
                  label="Font Size"
                  value={element.style.fontSize}
                  onChange={(value) =>
                    updateStyle({
                      fontSize: Math.max(1, value),
                    })
                  }
                />

                <PropertyInput
                  label="Font Weight"
                  value={element.style.fontWeight}
                  onChange={(value) =>
                    updateStyle({
                      fontWeight: value,
                    })
                  }
                />

                <div className="space-y-2">
                  <Label>Color</Label>

                  <Input
                    type="color"
                    value={element.style.color}
                    onChange={(event) =>
                      updateStyle({
                        color: event.target.value,
                      })
                    }
                    className="h-9 cursor-pointer p-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Alignment</Label>

                  <div className="grid grid-cols-3 gap-1">
                    {["left", "center", "right"].map((alignment) => (
                      <Button
                        key={alignment}
                        type="button"
                        variant={
                          element.style.textAlign === alignment
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          updateStyle({
                            textAlign: alignment,
                          })
                        }
                      >
                        {alignment.charAt(0).toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {element.type === "shape" && (
            <>
              <Separator />

              <section className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Shape
                </h3>

                <div className="space-y-2">
                  <Label>Fill</Label>

                  <Input
                    type="color"
                    value={element.style.fill}
                    onChange={(event) =>
                      updateStyle({
                        fill: event.target.value,
                      })
                    }
                    className="h-9 cursor-pointer p-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Border</Label>

                  <Input
                    type="color"
                    value={element.style.borderColor}
                    onChange={(event) =>
                      updateStyle({
                        borderColor: event.target.value,
                      })
                    }
                    className="h-9 cursor-pointer p-1"
                  />
                </div>

                <PropertyInput
                  label="Border Width"
                  value={element.style.borderWidth}
                  onChange={(value) =>
                    updateStyle({
                      borderWidth: Math.max(0, value),
                    })
                  }
                />

                {element.shape === "rectangle" && (
                  <PropertyInput
                    label="Radius"
                    value={element.style.borderRadius}
                    onChange={(value) =>
                      updateStyle({
                        borderRadius: Math.max(0, value),
                      })
                    }
                  />
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

function PropertyInput({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <Input
        type="number"
        value={value}
        onChange={(event) => {
          const nextValue = Number(event.target.value);

          if (Number.isNaN(nextValue)) {
            return;
          }

          onChange(nextValue);
        }}
      />
    </div>
  );
}
