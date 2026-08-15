import { createSlice } from '@reduxjs/toolkit'

const documentMetaSlice = createSlice({
  name: 'documentMeta',
  initialState: { id: null, name: 'Untitled design', status: 'idle', error: null, lastSavedAt: null },
  reducers: {
    setDocumentMeta: (state, action) => {
      state.id = action.payload.id
      state.name = action.payload.name || 'Untitled design'
      state.status = 'saved'
      state.error = null
      state.lastSavedAt = action.payload.updatedAt || new Date().toISOString()
    },
    setSaveStatus: (state, action) => { state.status = action.payload; if (action.payload !== 'error') state.error = null },
    setSaveError: (state, action) => { state.status = 'error'; state.error = action.payload },
    clearDocumentMeta: (state) => { state.id = null; state.name = 'Untitled design'; state.status = 'idle'; state.error = null; state.lastSavedAt = null },
    renameDocument: (state, action) => { state.name = action.payload },
  },
})

export const { setDocumentMeta, setSaveStatus, setSaveError, clearDocumentMeta, renameDocument } = documentMetaSlice.actions
export default documentMetaSlice.reducer
