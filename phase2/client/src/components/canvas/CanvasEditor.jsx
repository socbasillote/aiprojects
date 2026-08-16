import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Stage, Layer, Rect as KonvaRect, Line as KonvaLine } from 'react-konva'
import { useDispatch, useSelector } from 'react-redux'
import DesignElementRenderer from './DesignElementRenderer.jsx'
import SelectionTransformer from './SelectionTransformer.jsx'
import { selectElement, selectMultiple, toggleSelection, clearSelection } from '../../store/slices/selectionSlice.js'
import { updateElement, addElement, removeElement, duplicateElement, groupElements, ungroupElements, nudgeElements } from '../../store/slices/designSlice.js'
import { pushHistory } from '../../store/slices/historySlice.js'
import { setZoom } from '../../store/slices/uiSlice.js'

const clone = (v) => structuredClone(v)

export default function CanvasEditor({ stageRef }) {
  const dispatch = useDispatch()
  const document = useSelector((state) => state.design)
  const selectedIds = useSelector((state) => state.selection.ids)
  const zoom = useSelector((state) => state.ui.zoom)
  const snapping = useSelector((state) => state.ui.snapping)
  const [guides, setGuides] = useState([])
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const panRef = useRef({ x: 0, y: 0 })
  const [spaceDown, setSpaceDown] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const nodesById = useRef({})
  const textareaRef = useRef(null)
  const orderedElements = useMemo(() => document.elementOrder.map((id) => document.elements[id]).filter(Boolean), [document.elementOrder, document.elements])

  const commit = (id, changes) => {
    const before = clone(document)
    const after = clone(document)
    Object.assign(after.elements[id], changes)
    dispatch(updateElement({ id, changes }))
    dispatch(pushHistory({ before, after }))
  }

  const select = useCallback((id, multi) => dispatch(multi ? toggleSelection(id) : selectElement(id)), [dispatch])

  const startTextEdit = useCallback((id) => {
    const element = document.elements[id]
    if (!element || element.type !== 'text') return
    setEditingId(id)
    setEditValue(element.text)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }, [document.elements])

  const finishTextEdit = useCallback(() => {
    if (!editingId) return
    const element = document.elements[editingId]
    if (element && element.text !== editValue) commit(editingId, { text: editValue })
    setEditingId(null)
  }, [editingId, editValue, document.elements])

  const snapPosition = (id, node) => {
    if (!snapping) return { x: node.x(), y: node.y(), guides: [] }
    const element = document.elements[id]
    const width = Math.abs((node.width?.() || element?.width || 0) * (node.scaleX?.() || 1))
    const height = Math.abs((node.height?.() || element?.height || 0) * (node.scaleY?.() || 1))
    const x = node.x()
    const y = node.y()
    const threshold = 8 / Math.max(zoom, 0.01)
    const candidatesX = [
      { value: 0, guide: 'x0' },
      { value: document.canvas.width / 2 - width / 2, guide: 'xCenter' },
      { value: document.canvas.width - width, guide: 'xMax' },
    ]
    const candidatesY = [
      { value: 0, guide: 'y0' },
      { value: document.canvas.height / 2 - height / 2, guide: 'yCenter' },
      { value: document.canvas.height - height, guide: 'yMax' },
    ]
    for (const otherId of document.elementOrder) {
      if (otherId === id) continue
      const other = document.elements[otherId]
      if (!other || other.visible === false || other.type === 'group') continue
      const ow = other.width || 0, oh = other.height || 0
      candidatesX.push({ value: other.x || 0, guide: `v-${otherId}` }, { value: (other.x || 0) + ow, guide: `v-${otherId}-r` }, { value: (other.x || 0) + ow / 2 - width / 2, guide: `v-${otherId}-c` })
      candidatesY.push({ value: other.y || 0, guide: `h-${otherId}` }, { value: (other.y || 0) + oh, guide: `h-${otherId}-b` }, { value: (other.y || 0) + oh / 2 - height / 2, guide: `h-${otherId}-c` })
    }
    let sx = null, sy = null
    let bestX = threshold, bestY = threshold
    for (const c of candidatesX) { const d = Math.abs(c.value - x); if (d < bestX) { bestX = d; sx = c } }
    for (const c of candidatesY) { const d = Math.abs(c.value - y); if (d < bestY) { bestY = d; sy = c } }
    return { x: sx ? sx.value : x, y: sy ? sy.value : y, guides: [...(sx ? [{ orientation: 'v', value: sx.value + width / 2 }] : []), ...(sy ? [{ orientation: 'h', value: sy.value + height / 2 }] : [])] }
  }

  const handleDragStart = useCallback((event) => {
    event.cancelBubble = true
  }, [])

  const handleDragMove = useCallback((id, node, event) => {
    if (event) event.cancelBubble = true
    const snapped = snapPosition(id, node)
    if (snapped.x !== node.x()) node.x(snapped.x)
    if (snapped.y !== node.y()) node.y(snapped.y)
    setGuides(snapped.guides)
  }, [snapping, zoom, document])

  const handleWheel = (event) => {
    event.evt.preventDefault()

    const stage = event.target.getStage()
    if (!stage) return

    const oldScale = zoom
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const direction = event.evt.deltaY > 0 ? -1 : 1
    const scaleBy = 1.08
    const nextZoom = Math.min(4, Math.max(0.25, direction > 0 ? oldScale * scaleBy : oldScale / scaleBy))

    if (nextZoom === oldScale) return

    const mousePointTo = {
      x: (pointer.x - panRef.current.x) / oldScale,
      y: (pointer.y - panRef.current.y) / oldScale,
    }

    const nextPan = {
      x: pointer.x - mousePointTo.x * nextZoom,
      y: pointer.y - mousePointTo.y * nextZoom,
    }

    dispatch(setZoom(nextZoom))
    panRef.current = nextPan
    setPan(nextPan)
  }

  const handleDragEnd = useCallback((event) => {
    event.cancelBubble = true
  }, [])

  const handleTransformEnd = useCallback((id, changes) => {
    const node = nodesById.current[id]
    const snapped = node ? snapPosition(id, node) : { x: changes.x, y: changes.y, guides: [] }
    if (node) { node.x(snapped.x); node.y(snapped.y) }
    setGuides([])
    commit(id, { ...changes, x: snapped.x, y: snapped.y })
  }, [document, snapping, zoom])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code === 'Space' && !event.repeat && !editingId) {
        event.preventDefault()
        setSpaceDown(true)
      }
      if (event.key === 'Escape') dispatch(clearSelection())
    }
    const onKeyUp = (event) => {
      if (event.code === 'Space') {
        event.preventDefault()
        setSpaceDown(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [dispatch, editingId])

  return (
    <div className={`canvas-workspace flex h-full w-full items-center justify-center overflow-auto bg-[#171a20] p-10 scrollbar-thin ${spaceDown ? 'cursor-grab' : ''}`}>
      <div className="relative shrink-0 shadow-[0_24px_80px_rgba(0,0,0,.45)]" style={{ width: document.canvas.width * zoom, height: document.canvas.height * zoom }}>
        <Stage ref={stageRef} width={document.canvas.width} height={document.canvas.height} scaleX={zoom} scaleY={zoom} onWheel={handleWheel} x={pan.x} y={pan.y} draggable={spaceDown} onDragMove={(event) => { if (spaceDown) { event.target.x(event.target.x()); event.target.y(event.target.y()); panRef.current = { x: event.target.x(), y: event.target.y() } } }} onDragEnd={(event) => { if (spaceDown) { const nextPan = { x: event.target.x(), y: event.target.y() }; panRef.current = nextPan; setPan(nextPan) } }} onMouseDown={(e) => { if (e.target === e.target.getStage()) dispatch(clearSelection()) }}>
          <Layer>
            <KonvaRect x={0} y={0} width={document.canvas.width} height={document.canvas.height} fill={document.canvas.background} />
            {orderedElements.map((element) => (
              <DesignElementRenderer key={element.id} ref={(node) => { if (node) nodesById.current[element.id] = node }} element={element} onSelect={select} onDoubleClick={startTextEdit} onTransformEnd={handleTransformEnd} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd} />
            ))}
            {guides.map((guide, index) => guide.orientation === 'v' ? <KonvaLine key={`guide-v-${index}`} points={[guide.value, 0, guide.value, document.canvas.height]} stroke="#60a5fa" strokeWidth={1 / Math.max(zoom, 0.01)} dash={[6 / Math.max(zoom, 0.01), 6 / Math.max(zoom, 0.01)]} listening={false} /> : <KonvaLine key={`guide-h-${index}`} points={[0, guide.value, document.canvas.width, guide.value]} stroke="#60a5fa" strokeWidth={1 / Math.max(zoom, 0.01)} dash={[6 / Math.max(zoom, 0.01), 6 / Math.max(zoom, 0.01)]} listening={false} />)}
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
