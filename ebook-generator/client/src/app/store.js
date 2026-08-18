import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice.js";
import ebookReducer from "../features/ebooks/ebookSlice.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    ebooks: ebookReducer,
  },
});

export default store;
