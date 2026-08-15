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

    groupElements: (state, action) => {
      const ids = [...new Set(action.payload || [])].filter((id) => state.elements[id])
      if (ids.length < 2) return
      const groupId = makeId()
      const group = {
        id: groupId,
        type: 'group',
        name: 'Group',
        x: 0, y: 0, width: 0, height: 0,
        rotation: 0, opacity: 1, visible: true, locked: false,
        children: ids,
      }
      state.elements[groupId] = group
      for (const id of ids) state.elements[id].groupId = groupId
      const firstIndex = Math.min(...ids.map((id) => state.elementOrder.indexOf(id)).filter((i) => i >= 0))
      state.elementOrder = state.elementOrder.filter((id) => !ids.includes(id))
      state.elementOrder.splice(Math.max(0, firstIndex), 0, ...ids, groupId)
    },
    ungroupElements: (state, action) => {
      const groupIds = (action.payload || []).filter((id) => state.elements[id]?.type === 'group')
      for (const groupId of groupIds) {
        const group = state.elements[groupId]
        for (const childId of group.children || []) {
          if (state.elements[childId]) delete state.elements[childId].groupId
        }
        delete state.elements[groupId]
        state.elementOrder = state.elementOrder.filter((id) => id !== groupId)
      }
    },

    alignElements: (state, action) => {
      const { ids = [], axis = 'horizontal' } = action.payload || {}
      const valid = ids.filter((id) => state.elements[id] && state.elements[id].type !== 'group')
      if (!valid.length) return
      if (axis === 'horizontal') {
        for (const id of valid) {
          const el = state.elements[id]
          el.x = (state.canvas.width - (el.width || 0)) / 2
        }
      } else {
        for (const id of valid) {
          const el = state.elements[id]
          el.y = (state.canvas.height - (el.height || 0)) / 2
        }
      }
    },
    nudgeElements: (state, action) => {
      const { ids = [], dx = 0, dy = 0 } = action.payload || {}
      for (const id of ids) {
        if (!state.elements[id] || state.elements[id].locked) continue
        state.elements[id].x = (state.elements[id].x || 0) + dx
        state.elements[id].y = (state.elements[id].y || 0) + dy
      }
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
  groupElements,
  ungroupElements,
  nudgeElements,
  alignElements,
  setBackground,
  replaceDocument,
} = designSlice.actions

export default designSlice.reducer
