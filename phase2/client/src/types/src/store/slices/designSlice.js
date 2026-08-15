import { createSlice } from '@reduxjs/toolkit'
import { createDefaultDocument, normalizeDesignDocument } from '../../types/design.js'

const initialState = createDefaultDocument()

const makeId = () => crypto.randomUUID()

const designSlice = createSlice({
  name: 'design',
  initialState,
  reducers: {
    addElement: (state, action) => {
      const element = { ...action.payload, id: action.payload.id || makeId() }
      if (!state.elements || typeof state.elements !== 'object' || Array.isArray(state.elements)) state.elements = {}
      if (!Array.isArray(state.elementOrder)) state.elementOrder = []
      state.elements[element.id] = element
      if (!state.elementOrder.includes(element.id)) state.elementOrder.push(element.id)
    },
    removeElement: (state, action) => {
      const id = action.payload
      delete state.elements[id]
      state.elementOrder = state.elementOrder.filter((elementId) => elementId !== id)
    },
    updateElement: (state, action) => {
      const { id, changes } = action.payload
      if (!state.elements[id]) return
      Object.assign(state.elements[id], changes)
    },
    duplicateElement: (state, action) => {
      const source = state.elements[action.payload]
      if (!source) return
      const id = makeId()
      const copy = {
        ...source,
        id,
        name: `${source.name || source.type} Copy`,
        x: (source.x || 0) + 24,
        y: (source.y || 0) + 24,
      }
      state.elements[id] = copy
      const index = state.elementOrder.indexOf(action.payload)
      state.elementOrder.splice(index + 1, 0, id)
    },
    moveLayerUp: (state, action) => {
      const index = state.elementOrder.indexOf(action.payload)
      if (index < state.elementOrder.length - 1) {
        ;[state.elementOrder[index], state.elementOrder[index + 1]] = [state.elementOrder[index + 1], state.elementOrder[index]]
      }
    },
    moveLayerDown: (state, action) => {
      const index = state.elementOrder.indexOf(action.payload)
      if (index > 0) {
        ;[state.elementOrder[index], state.elementOrder[index - 1]] = [state.elementOrder[index - 1], state.elementOrder[index]]
      }
    },
    bringToFront: (state, action) => {
      state.elementOrder = state.elementOrder.filter((id) => id !== action.payload)
      state.elementOrder.push(action.payload)
    },
    sendToBack: (state, action) => {
      state.elementOrder = state.elementOrder.filter((id) => id !== action.payload)
      state.elementOrder.unshift(action.payload)
    },
    setCanvasSize: (state, action) => {
      state.canvas.width = action.payload.width
      state.canvas.height = action.payload.height
    },
    setBackground: (state, action) => {
      state.canvas.background = action.payload
    },

    replaceDocument: (_state, action) => normalizeDesignDocument(action.payload),
  },
})

export const {
  addElement,
  removeElement,
  updateElement,
  duplicateElement,
  moveLayerUp,
  moveLayerDown,
  bringToFront,
  sendToBack,
  setCanvasSize,
  setBackground,
  replaceDocument,
} = designSlice.actions

export default designSlice.reducer
