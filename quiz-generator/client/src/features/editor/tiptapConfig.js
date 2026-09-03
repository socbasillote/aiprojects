import { mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";

const QuestionImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
      },
      alignment: {
        default: "left",
      },
      caption: {
        default: "",
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { width, alignment, caption, ...imageAttributes } = HTMLAttributes;
    const alignmentStyle =
      alignment === "center"
        ? "margin-left:auto;margin-right:auto;"
        : alignment === "right"
          ? "margin-left:auto;"
          : "margin-right:auto;";

    return [
      "figure",
      { style: alignmentStyle },
      [
        "img",
        mergeAttributes(this.options.HTMLAttributes, imageAttributes, {
          style: `width:${width};max-width:100%;height:auto;`,
        }),
      ],
      ...(caption ? [["figcaption", {}, caption]] : []),
    ];
  },
});

export function createQuestionEditorExtensions({
  placeholder = false,
  placeholderText = "Write your question...",
} = {}) {
  return [
    StarterKit,
    Underline,
    QuestionImage.configure({
      allowBase64: true,
    }),
    ...(placeholder
      ? [
          Placeholder.configure({
            placeholder: placeholderText,
          }),
        ]
      : []),
  ];
}
