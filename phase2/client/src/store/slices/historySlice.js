import { createSlice } from '@reduxjs/toolkit'

const initialState = { past: [], future: [] }

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    pushHistory: (state, action) => {
      state.past.push(action.payload)
      if (state.past.length > 100) state.past.shift()
      state.future = []
    },
    undoHistory: (state) => {
      if (!state.past.length) return
      state.future.unshift(state.past.pop())
    },
    redoHistory: (state) => {
      if (!state.future.length) return
      state.past.push(state.future.shift())
    },
    clearHistory: (state) => {
      state.past = []
      state.future = []
    },
  },
})

export const { pushHistory, undoHistory, redoHistory, clearHistory } = historySlice.actions
export default historySlice.reducer
