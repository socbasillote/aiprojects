import { configureStore } from '@reduxjs/toolkit'
import designReducer from './slices/designSlice.js'
import selectionReducer from './slices/selectionSlice.js'
import historyReducer from './slices/historySlice.js'
import uiReducer from './slices/uiSlice.js'
import authReducer from './slices/authSlice.js'
import documentMetaReducer from './slices/documentMetaSlice.js'

export const store = configureStore({
  reducer: {
    design: designReducer,
    selection: selectionReducer,
    history: historyReducer,
    ui: uiReducer,
    auth: authReducer,
    documentMeta: documentMetaReducer,
  },
})
