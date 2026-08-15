import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activePanel: 'layers',
    zoom: 0.62,
    isTextEditing: false,
    editingTextId: null,
  },
  reducers: {
    setActivePanel: (state, action) => { state.activePanel = action.payload },
    setZoom: (state, action) => { state.zoom = action.payload },
    setTextEditing: (state, action) => {
      state.isTextEditing = action.payload.isEditing
      state.editingTextId = action.payload.id || null
    },
  },
})

export const { setActivePanel, setZoom, setTextEditing } = uiSlice.actions
export default uiSlice.reducer
