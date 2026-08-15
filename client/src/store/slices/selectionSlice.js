import { createSlice } from '@reduxjs/toolkit'

const selectionSlice = createSlice({
  name: 'selection',
  initialState: { ids: [] },
  reducers: {
    selectElement: (state, action) => { state.ids = [action.payload] },
    selectMultiple: (state, action) => { state.ids = action.payload },
    toggleSelection: (state, action) => {
      const id = action.payload
      state.ids = state.ids.includes(id) ? state.ids.filter((item) => item !== id) : [...state.ids, id]
    },
    clearSelection: (state) => { state.ids = [] },
  },
})

export const { selectElement, selectMultiple, toggleSelection, clearSelection } = selectionSlice.actions
export default selectionSlice.reducer
