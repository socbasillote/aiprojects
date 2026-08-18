import { useDispatch, useSelector } from "react-redux";
import {
  updateElement,
  setBackground,
} from "../../store/slices/designSlice.js";
import { pushHistory } from "../../store/slices/historySlice.js";

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
      {label}
    </span>
    {children}
  </label>
);
const Input = (props) => (
  <input
    {...props}
    className="w-full rounded-lg border border-white/10 bg-[#181b21] px-2.5 py-2 text-sm text-slate-200 outline-none focus:border-blue-500/70"
  />
);

export default function PropertiesPanel() {
  const dispatch = useDispatch();
  const design = useSelector((s) => s.design);
  const id = useSelector((s) => s.selection.ids[0]);
  const element = id ? design.elements[id] : null;

  const change = (changes) => {
    if (!element) return;
    const before = structuredClone(design);
    const after = structuredClone(design);
    Object.assign(after.elements[id], changes);
    dispatch(updateElement({ id, changes }));
    dispatch(pushHistory({ before, after }));
  };

  if (!element)
    return (
      <div className="h-full p-4">
        <div className="mb-5 text-[11px] font-semibold tracking-[.14em] text-slate-400">
          PROPERTIES
        </div>
        <p className="text-sm text-slate-500">
          Select an element to edit its properties.
        </p>
      </div>
    );

  return (
    <div className="h-full overflow-y-auto p-4 scrollbar-thin">
      <div className="mb-5 flex items-center justify-between">
        <div className="text-[11px] font-semibold tracking-[.14em] text-slate-400">
          PROPERTIES
        </div>
        <span className="rounded bg-white/5 px-2 py-1 text-[10px] text-slate-500">
          {element.type}
        </span>
      </div>
      <div className="space-y-4">
        <Field label="Name">
          <Input
            value={element.name || ""}
            onChange={(e) => change({ name: e.target.value })}
          />
        </Field>
        {element.type === "text" && (
          <>
            <Field label="Content">
              <textarea
                value={element.text}
                onChange={(e) => change({ text: e.target.value })}
                rows={3}
                className="w-full resize-none rounded-lg border border-white/10 bg-[#181b21] px-2.5 py-2 text-sm text-slate-200 outline-none focus:border-blue-500/70"
              />
            </Field>
            <Field label="Font">
              <Input
                value={element.fontFamily}
                onChange={(e) => change({ fontFamily: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Size">
                <Input
                  type="number"
                  value={element.fontSize}
                  onChange={(e) => change({ fontSize: Number(e.target.value) })}
                />
              </Field>
              <Field label="Weight">
                <Input
                  type="number"
                  value={element.fontWeight || 400}
                  onChange={(e) =>
                    change({ fontWeight: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
            <Field label="Color">
              <Input
                type="color"
                value={element.fill}
                onChange={(e) => change({ fill: e.target.value })}
                className="h-10 w-full rounded-lg border border-white/10 bg-[#181b21]"
              />
            </Field>
          </>
        )}
        {element.type === "svg" && (
          <div className="rounded-lg border border-white/10 bg-white/2 p-3 text-xs leading-5 text-slate-400">
            SVG artwork is preserved as a single editable vector asset. You can
            move, resize, rotate, hide, lock, replace, and export it without
            rasterizing the original file.
          </div>
        )}
        {(element.type === "rect" ||
          element.type === "circle" ||
          element.type === "ellipse") && (
          <>
            <Field label="Fill">
              <Input
                type="color"
                value={element.fill || "#111827"}
                onChange={(e) => change({ fill: e.target.value })}
                className="h-10"
              />
            </Field>
            <Field label="Stroke">
              <Input
                type="color"
                value={element.stroke || "#000000"}
                onChange={(e) => change({ stroke: e.target.value })}
                className="h-10"
              />
            </Field>
            {element.type === "rect" && (
              <Field label="Corner Radius">
                <Input
                  type="number"
                  value={element.cornerRadius || 0}
                  onChange={(e) =>
                    change({ cornerRadius: Number(e.target.value) })
                  }
                />
              </Field>
            )}
          </>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="X">
            <Input
              type="number"
              value={Math.round(element.x)}
              onChange={(e) => change({ x: Number(e.target.value) })}
            />
          </Field>
          <Field label="Y">
            <Input
              type="number"
              value={Math.round(element.y)}
              onChange={(e) => change({ y: Number(e.target.value) })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Width">
            <Input
              type="number"
              value={Math.round(element.width || 0)}
              onChange={(e) => change({ width: Number(e.target.value) })}
            />
          </Field>
          <Field label="Height">
            <Input
              type="number"
              value={Math.round(element.height || 0)}
              onChange={(e) => change({ height: Number(e.target.value) })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Rotation">
            <Input
              type="number"
              value={Math.round(element.rotation || 0)}
              onChange={(e) => change({ rotation: Number(e.target.value) })}
            />
          </Field>
          <Field label="Opacity">
            <Input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={element.opacity ?? 1}
              onChange={(e) => change({ opacity: Number(e.target.value) })}
            />
          </Field>
        </div>
        <div className="border-t border-white/10 pt-4">
          <Field label="Canvas Background">
            <Input
              type="color"
              value={design.canvas.background}
              onChange={(e) => dispatch(setBackground(e.target.value))}
              className="h-10"
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
