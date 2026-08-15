import { Eye, EyeOff, GripVertical, Lock, Unlock, Trash2, Copy, ChevronUp, ChevronDown } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { selectElement } from '../../store/slices/selectionSlice.js'
import { duplicateElement, removeElement, updateElement, moveLayerUp, moveLayerDown } from '../../store/slices/designSlice.js'

export default function LayerPanel() {
  const dispatch = useDispatch()
  const { elements, elementOrder } = useSelector((s) => s.design)
  const selected = useSelector((s) => s.selection.ids)
  const rows = [...elementOrder].reverse()
  return (
    <div className="h-full overflow-y-auto p-3 scrollbar-thin">
      <div className="mb-3 px-1 text-[11px] font-semibold tracking-[.14em] text-slate-400">LAYERS</div>
      <div className="space-y-1">
        {rows.map((id) => {
          const item = elements[id]
          if (!item) return null
          const active = selected.includes(id)
          return (
            <div key={id} className={`group flex items-center gap-1 rounded-lg px-2 py-2 ${active ? 'bg-blue-500/15 ring-1 ring-blue-500/30' : 'hover:bg-white/[.04]'}`}>
              <GripVertical size={14} className="shrink-0 text-slate-600" />
              <button className="min-w-0 flex-1 truncate text-left text-sm text-slate-200" onClick={() => dispatch(selectElement(id))}>{item.name || item.type}</button>
              <button title={item.visible ? 'Hide' : 'Show'} onClick={() => dispatch(updateElement({ id, changes: { visible: !item.visible } }))} className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-white">{item.visible ? <Eye size={14}/> : <EyeOff size={14}/>}</button>
              <button title={item.locked ? 'Unlock' : 'Lock'} onClick={() => dispatch(updateElement({ id, changes: { locked: !item.locked } }))} className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-white">{item.locked ? <Lock size={14}/> : <Unlock size={14}/>}</button>
              <div className="hidden items-center group-hover:flex">
                <button onClick={() => dispatch(moveLayerDown(id))} className="rounded p-1 text-slate-500 hover:text-white"><ChevronDown size={13}/></button>
                <button onClick={() => dispatch(moveLayerUp(id))} className="rounded p-1 text-slate-500 hover:text-white"><ChevronUp size={13}/></button>
                <button onClick={() => dispatch(duplicateElement(id))} className="rounded p-1 text-slate-500 hover:text-white"><Copy size={13}/></button>
                <button onClick={() => dispatch(removeElement(id))} className="rounded p-1 text-slate-500 hover:text-red-400"><Trash2 size={13}/></button>
              </div>
            </div>
          )
        })}
        {!rows.length && <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-slate-500">No layers yet.</div>}
      </div>
    </div>
  )
}
