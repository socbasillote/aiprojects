import { configureStore } from "@reduxjs/toolkit";
import editorReducer from "../features/editor/editorSlice";
import { createHistoryReducer } from "../features/editor/historyReducer";

const historyReducer = createHistoryReducer(editorReducer);

export const store = configureStore({
  reducer: {
    editor: historyReducer,
  },
});
