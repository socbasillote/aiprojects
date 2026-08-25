const initialState = {
  past: [],

  present: {
    document: {
      id: "document-1",

      settings: {
        width: 595,
        height: 842,
        background: "#ffffff",
      },

      pages: [firstPage],

      activePageId: firstPage.id,
    },

    selectedElementId: null,
  },

  future: [],
};
