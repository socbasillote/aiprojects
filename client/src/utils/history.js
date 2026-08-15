import { pushHistory, undoHistory, redoHistory } from '../store/slices/historySlice.js'
import { replaceDocument } from '../store/slices/designSlice.js'

export const cloneDocument = (document) => structuredClone(document)

export const recordDesignChange = (dispatch, getState, mutation) => {
  const before = cloneDocument(getState().design)
  mutation()
  const after = cloneDocument(getState().design)
  dispatch(pushHistory({ before, after }))
}

export const undo = (dispatch, getState) => {
  const entry = getState().history.past.at(-1)
  if (!entry) return false
  dispatch(replaceDocument(entry.before))
  dispatch(undoHistory())
  return true
}

export const redo = (dispatch, getState) => {
  const entry = getState().history.future[0]
  if (!entry) return false
  dispatch(replaceDocument(entry.after))
  dispatch(redoHistory())
  return true
}
