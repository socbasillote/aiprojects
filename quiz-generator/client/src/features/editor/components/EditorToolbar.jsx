import { useEffect, useState } from "react";

export default function EditorToolbar({ editor, onAddImage, className = "" }) {
  const [, setVersion] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const update = () => setVersion((value) => value + 1);

    editor.on("selectionUpdate", update);
    editor.on("transaction", update);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const buttonClass = (active = false) =>
    [
      "rounded-md px-2.5 py-1.5 text-sm font-medium transition",
      active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
    ].join(" ");

  function updateImageAttributes(changes) {
    editor.chain().focus().updateAttributes("image", changes).run();
  }

  function editCaption() {
    const currentCaption = editor.getAttributes("image").caption || "";
    const caption = window.prompt("Caption", currentCaption);

    if (caption !== null) {
      updateImageAttributes({ caption });
    }
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-1 border-b border-slate-200 p-2 ${className}`}
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive("bold"))}
      >
        B
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive("italic"))}
      >
        <em>I</em>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline?.().run()}
        className={buttonClass(editor.isActive("underline"))}
      >
        <u>U</u>
      </button>

      <div className="mx-1 h-5 w-px bg-slate-200" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive("bulletList"))}
      >
        • List
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive("orderedList"))}
      >
        1. List
      </button>

      <button type="button" onClick={onAddImage} className={buttonClass()}>
        Image
      </button>

      {editor.isActive("image") && (
        <>
          <select
            aria-label="Image width"
            value={editor.getAttributes("image").width || "100%"}
            onChange={(event) =>
              updateImageAttributes({ width: event.target.value })
            }
            className="rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-600"
          >
            <option value="25%">25%</option>
            <option value="50%">50%</option>
            <option value="75%">75%</option>
            <option value="100%">100%</option>
          </select>

          <button
            type="button"
            onClick={() => updateImageAttributes({ alignment: "left" })}
            className={buttonClass(
              editor.getAttributes("image").alignment === "left",
            )}
          >
            Left
          </button>

          <button
            type="button"
            onClick={() => updateImageAttributes({ alignment: "center" })}
            className={buttonClass(
              editor.getAttributes("image").alignment === "center",
            )}
          >
            Center
          </button>

          <button
            type="button"
            onClick={() => updateImageAttributes({ alignment: "right" })}
            className={buttonClass(
              editor.getAttributes("image").alignment === "right",
            )}
          >
            Right
          </button>

          <button
            type="button"
            onClick={editCaption}
            className={buttonClass(
              Boolean(editor.getAttributes("image").caption),
            )}
          >
            Caption
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteSelection().run()}
            className={buttonClass()}
          >
            Delete
          </button>
        </>
      )}

      <div className="mx-1 h-5 w-px bg-slate-200" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="rounded-md px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-30"
      >
        Undo
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="rounded-md px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-30"
      >
        Redo
      </button>
    </div>
  );
}
