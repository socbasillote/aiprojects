import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activePanel: 'layers',
    zoom: 0.62,
    snapping: true,
    isTextEditing: false,
    editingTextId: null,
  },
  reducers: {
    setActivePanel: (state, action) => { state.activePanel = action.payload },
    setZoom: (state, action) => { state.zoom = action.payload },
    setSnapping: (state, action) => { state.snapping = action.payload },
    setTextEditing: (state, action) => {
      state.isTextEditing = action.payload.isEditing
      state.editingTextId = action.payload.id || null
    },
  },
})

export const { setActivePanel, setZoom, setSnapping, setTextEditing } = uiSlice.actions
export default uiSlice.reducer
