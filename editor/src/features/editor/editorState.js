export function createEditorState() {
  return {
    document: {
      id: "document-1",

      settings: {
        width: 595,
        height: 842,
        background: "#ffffff",
      },

      pages: [],
      activePageId: null,
    },

    selectedElementId: null,
  };
}
