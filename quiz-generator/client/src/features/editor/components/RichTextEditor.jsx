import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";

import EditorToolbar from "./EditorToolbar";

export default function RichTextEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "Write your question...",
      }),
    ],

    content,

    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[120px] px-5 py-4 outline-none",
      },
    },

    onUpdate({ editor }) {
      onChange(editor.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentContent = editor.getJSON();

    if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
      editor.commands.setContent(content || "");
    }
  }, [editor, content]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <EditorToolbar editor={editor} />

      <EditorContent editor={editor} />
    </div>
  );
}
