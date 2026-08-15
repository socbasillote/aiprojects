import { useEffect, useMemo, useRef, useState } from 'react'
import { Stage, Layer, Rect as KonvaRect } from 'react-konva'
import { useDispatch, useSelector } from 'react-redux'
import DesignElementRenderer from './DesignElementRenderer.jsx'
import SelectionTransformer from './SelectionTransformer.jsx'
import { selectElement, toggleSelection, clearSelection } from '../../store/slices/selectionSlice.js'
import { updateElement } from '../../store/slices/designSlice.js'
import { pushHistory } from '../../store/slices/historySlice.js'

const clone = (v) => structuredClone(v)

export default function CanvasEditor({ stageRef }) {
  const dispatch = useDispatch()
  const document = useSelector((state) => state.design)
  const selectedIds = useSelector((state) => state.selection.ids)
  const zoom = useSelector((state) => state.ui.zoom)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const nodesById = useRef({})
  const textareaRef = useRef(null)
  const orderedElements = useMemo(() => document.elementOrder.map((id) => document.elements[id]).filter(Boolean), [document])

  const commit = (id, changes) => {
    const before = clone(document)
    const after = clone(document)
    Object.assign(after.elements[id], changes)
    dispatch(updateElement({ id, changes }))
    dispatch(pushHistory({ before, after }))
  }

  const select = (id, multi) => dispatch(multi ? toggleSelection(id) : selectElement(id))

  const startTextEdit = (id) => {
    const element = document.elements[id]
    if (!element || element.type !== 'text') return
    setEditingId(id)
    setEditValue(element.text)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  const finishTextEdit = () => {
    if (!editingId) return
    const element = document.elements[editingId]
    if (element && element.text !== editValue) commit(editingId, { text: editValue })
    setEditingId(null)
  }

  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') dispatch(clearSelection()) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch])

  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto bg-[#171a20] p-10 scrollbar-thin">
      <div className="relative shrink-0 shadow-[0_24px_80px_rgba(0,0,0,.45)]" style={{ width: document.canvas.width * zoom, height: document.canvas.height * zoom }}>
        <Stage ref={stageRef} width={document.canvas.width * zoom} height={document.canvas.height * zoom} scaleX={zoom} scaleY={zoom} onMouseDown={(e) => { if (e.target === e.target.getStage()) dispatch(clearSelection()) }}>
          <Layer>
            <KonvaRect x={0} y={0} width={document.canvas.width} height={document.canvas.height} fill={document.canvas.background} />
            {orderedElements.map((element) => (
              <DesignElementRenderer key={element.id} ref={(node) => { if (node) nodesById.current[element.id] = node }} element={element} onSelect={select} onDoubleClick={startTextEdit} onTransformEnd={commit} />
            ))}
            <SelectionTransformer selectedIds={selectedIds} nodesById={nodesById} />
          </Layer>
        </Stage>
        {editingId && (
          <textarea ref={textareaRef} value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={finishTextEdit} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); finishTextEdit() } if (e.key === 'Escape') setEditingId(null) }} className="absolute left-3 top-3 z-20 min-h-24 min-w-72 resize-none rounded-lg border border-blue-500 bg-white p-3 text-sm text-black shadow-xl outline-none" />
        )}
      </div>
    </div>
  )
}
