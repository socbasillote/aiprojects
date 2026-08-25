import { createSlice } from "@reduxjs/toolkit";

function createPage() {
  return {
    id: crypto.randomUUID(),
    elements: [],
  };
}

function createTextElement() {
  return {
    id: crypto.randomUUID(),

    type: "text",

    x: 100,
    y: 100,

    width: 240,
    height: 50,

    rotation: 0,

    content: "Double-click to edit",

    style: {
      fontSize: 24,
      fontFamily: "Arial",
      fontWeight: 400,
      color: "#111111",
      textAlign: "left",
    },
  };
}

const firstPage = createPage();

function createImageElement({ src, width, height }) {
  return {
    id: crypto.randomUUID(),

    type: "image",

    x: 100,
    y: 100,

    width,
    height,

    rotation: 0,

    src,
  };
}

function createShapeElement({ shape }) {
  return {
    id: crypto.randomUUID(),

    type: "shape",

    shape,

    x: 100,
    y: 100,

    width: 200,
    height: 120,

    rotation: 0,

    style: {
      fill: "#3b82f6",
      borderColor: "#1d4ed8",
      borderWidth: 0,
      borderRadius: 0,
    },
  };
}

function findPageContainingElement(state, elementId) {
  return state.document.pages.find((page) =>
    page.elements.some((element) => element.id === elementId),
  );
}

const initialState = {
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

  viewport: {
    zoom: 1,
    panX: 0,
    panY: 0,
  },
};

const editorSlice = createSlice({
  name: "editor",

  initialState,

  reducers: {
    addPage(state) {
      const page = {
        id: crypto.randomUUID(),
        elements: [],
      };

      state.document.pages.push(page);

      state.document.activePageId = page.id;

      state.selectedElementId = null;
    },

    selectPage(state, action) {
      const pageId = action.payload;

      const page = state.document.pages.find((page) => page.id === pageId);

      if (!page) return;

      state.document.activePageId = pageId;

      state.selectedElementId = null;
    },

    deletePage(state, action) {
      const pageId = action.payload;

      if (state.document.pages.length <= 1) {
        return;
      }

      const index = state.document.pages.findIndex(
        (page) => page.id === pageId,
      );

      if (index === -1) return;

      state.document.pages.splice(index, 1);

      if (state.document.activePageId === pageId) {
        const nextPage = state.document.pages[Math.max(0, index - 1)];

        state.document.activePageId = nextPage.id;
      }

      state.selectedElementId = null;
    },

    addTextElement(state) {
      const page = state.document.pages.find(
        (page) => page.id === state.document.activePageId,
      );

      if (!page) return;

      const element = createTextElement();

      page.elements.push(element);

      state.selectedElementId = element.id;
    },

    selectElement(state, action) {
      state.selectedElementId = action.payload;
    },

    clearSelection(state) {
      state.selectedElementId = null;
    },

    deleteElement(state, action) {
      const elementId = action.payload;

      for (const page of state.document.pages) {
        page.elements = page.elements.filter(
          (element) => element.id !== elementId,
        );
      }

      if (state.selectedElementId === elementId) {
        state.selectedElementId = null;
      }
    },

    moveElement(state, action) {
      const { elementId, x, y } = action.payload;

      for (const page of state.document.pages) {
        const element = page.elements.find(
          (element) => element.id === elementId,
        );

        if (!element) continue;

        element.x = x;
        element.y = y;

        break;
      }
    },

    resizeElement(state, action) {
      const { elementId, x, y, width, height } = action.payload;

      for (const page of state.document.pages) {
        const element = page.elements.find(
          (element) => element.id === elementId,
        );

        if (!element) continue;

        element.x = x;
        element.y = y;
        element.width = width;
        element.height = height;

        break;
      }
    },

    updateElement(state, action) {
      const { elementId, changes } = action.payload;

      for (const page of state.document.pages) {
        const element = page.elements.find(
          (element) => element.id === elementId,
        );

        if (!element) continue;

        Object.assign(element, changes);

        break;
      }
    },

    updateElementContent(state, action) {
      const { elementId, content } = action.payload;

      for (const page of state.document.pages) {
        const element = page.elements.find(
          (element) => element.id === elementId,
        );

        if (!element) continue;

        element.content = content;

        break;
      }
    },

    duplicateElement(state, action) {
      const elementId = action.payload;

      for (const page of state.document.pages) {
        const index = page.elements.findIndex(
          (element) => element.id === elementId,
        );

        if (index === -1) continue;

        const original = page.elements[index];

        const duplicate = {
          ...original,

          id: crypto.randomUUID(),

          x: original.x + 20,
          y: original.y + 20,

          style: original.style
            ? {
                ...original.style,
              }
            : undefined,
        };

        page.elements.splice(index + 1, 0, duplicate);

        state.selectedElementId = duplicate.id;

        break;
      }
    },

    addImageElement(state, action) {
      const page = state.document.pages.find(
        (page) => page.id === state.document.activePageId,
      );

      if (!page) return;

      const element = createImageElement(action.payload);

      page.elements.push(element);

      state.selectedElementId = element.id;
    },
    addShapeElement(state, action) {
      const page = state.document.pages.find(
        (page) => page.id === state.document.activePageId,
      );

      if (!page) return;

      const element = createShapeElement(action.payload);

      page.elements.push(element);

      state.selectedElementId = element.id;
    },

    previewMoveElement(state, action) {
      const { elementId, x, y } = action.payload;

      for (const page of state.document.pages) {
        const element = page.elements.find(
          (element) => element.id === elementId,
        );

        if (!element) continue;

        element.x = x;
        element.y = y;

        break;
      }
    },

    previewResizeElement(state, action) {
      const { elementId, x, y, width, height } = action.payload;

      for (const page of state.document.pages) {
        const element = page.elements.find(
          (element) => element.id === elementId,
        );

        if (!element) continue;

        element.x = x;
        element.y = y;
        element.width = width;
        element.height = height;

        break;
      }
    },

    commitMoveElement() {
      // History reducer handles this.
    },

    commitResizeElement() {
      // History reducer handles this.
    },
    setZoom(state, action) {
      state.viewport.zoom = action.payload;
    },

    setPan(state, action) {
      state.viewport.panX = action.payload.x;
      state.viewport.panY = action.payload.y;
    },

    setViewport(state, action) {
      const { zoom, panX, panY } = action.payload;

      state.viewport.zoom = zoom;
      state.viewport.panX = panX;
      state.viewport.panY = panY;
    },

    resetViewport(state) {
      state.viewport.zoom = 1;
      state.viewport.panX = 0;
      state.viewport.panY = 0;
    },
    bringElementToFront(state, action) {
      const elementId = action.payload;

      const page = findPageContainingElement(state, elementId);

      if (!page) return;

      const index = page.elements.findIndex(
        (element) => element.id === elementId,
      );

      if (index === -1) return;

      const [element] = page.elements.splice(index, 1);

      page.elements.push(element);
    },

    sendElementToBack(state, action) {
      const elementId = action.payload;

      const page = findPageContainingElement(state, elementId);

      if (!page) return;

      const index = page.elements.findIndex(
        (element) => element.id === elementId,
      );

      if (index === -1) return;

      const [element] = page.elements.splice(index, 1);

      page.elements.unshift(element);
    },

    bringElementForward(state, action) {
      const elementId = action.payload;

      const page = findPageContainingElement(state, elementId);

      if (!page) return;

      const index = page.elements.findIndex(
        (element) => element.id === elementId,
      );

      if (index === -1 || index === page.elements.length - 1) {
        return;
      }

      const element = page.elements[index];

      page.elements[index] = page.elements[index + 1];

      page.elements[index + 1] = element;
    },

    sendElementBackward(state, action) {
      const elementId = action.payload;

      const page = findPageContainingElement(state, elementId);

      if (!page) return;

      const index = page.elements.findIndex(
        (element) => element.id === elementId,
      );

      if (index <= 0) {
        return;
      }

      const element = page.elements[index];

      page.elements[index] = page.elements[index - 1];

      page.elements[index - 1] = element;
    },
  },
});

export const {
  addPage,
  selectPage,
  deletePage,
  addTextElement,
  addImageElement,
  selectElement,
  clearSelection,
  deleteElement,
  previewMoveElement,
  previewResizeElement,
  commitMoveElement,
  commitResizeElement,
  moveElement,
  resizeElement,
  updateElement,
  updateElementContent,
  duplicateElement,
  addShapeElement,

  bringElementToFront,
  sendElementToBack,
  bringElementForward,
  sendElementBackward,

  setZoom,
  setPan,
  setViewport,
  resetViewport,
} = editorSlice.actions;

export default editorSlice.reducer;
