import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";

import EditorToolbar from "./EditorToolbar";
import { createQuestionEditorExtensions } from "../tiptapConfig";

export default function QuestionContentEditor({
  content,
  onChange,
  showToolbar = true,
  onEditorReady,
  paperOverlay = false,
  placeholderText,
}) {
  const imageInputRef = useRef(null);

  const editor = useEditor({
    extensions: createQuestionEditorExtensions({
      placeholder: true,
      placeholderText,
    }),

    content,

    editorProps: {
      attributes: {
        class: paperOverlay
          ? "prose prose-slate max-w-none min-h-0 p-0 outline-none"
          : "prose prose-slate max-w-none min-h-[120px] px-5 py-4 outline-none",
      },
    },

    onUpdate({ editor }) {
      onChange(editor.getJSON());
    },
  });

  function handleImageSelected(event) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file || !editor) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        return;
      }

      editor
        .chain()
        .focus()
        .setImage({
          src: reader.result,
          alt: file.name,
          width: "100%",
          alignment: "left",
          caption: "",
        })
        .run();
    };

    reader.readAsDataURL(file);
  }

  useEffect(() => {
    if (!editor) return;

    const currentContent = editor.getJSON();

    if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
      editor.commands.setContent(content || "");
    }
  }, [editor, content]);

  useEffect(() => {
    if (!editor || !onEditorReady) return;

    onEditorReady({
      editor,
      addImage: () => imageInputRef.current?.click(),
    });
  }, [editor, onEditorReady]);

  return (
    <div
      className={
        paperOverlay
          ? "absolute inset-0 z-10 overflow-visible"
          : "overflow-hidden rounded-xl border border-slate-200 bg-white"
      }
    >
      {showToolbar && (
        <EditorToolbar
          editor={editor}
          onAddImage={() => imageInputRef.current?.click()}
        />
      )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelected}
        className="hidden"
      />

      <EditorContent editor={editor} />
    </div>
  );
}
