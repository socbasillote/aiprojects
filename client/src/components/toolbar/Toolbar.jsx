import { Type, Square, Circle as CircleIcon, ImagePlus, Undo2, Redo2, ZoomIn, ZoomOut, LogOut, Cloud, Download, ChevronDown, Image as ImageIcon, FileImage, FileCode2, Home } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { addElement } from '../../store/slices/designSlice.js'
import { selectElement } from '../../store/slices/selectionSlice.js'
import { pushHistory } from '../../store/slices/historySlice.js'
import { setZoom, setSnapping } from '../../store/slices/uiSlice.js'
import { api, API_URL } from '../../services/api.js'
import { exportRaster, exportSvg, exportSelectedImage, exportJson } from '../../utils/export.js'
import { useState } from 'react'

const make = (payload) => ({ id: crypto.randomUUID(), visible: true, locked: false, opacity: 1, rotation: 0, ...payload })

export default function Toolbar({ onUndo, onRedo, onLogout, onHome, saveStatus, stageRef, projectName }) {
  const dispatch = useDispatch()
  const zoom = useSelector((s) => s.ui.zoom)
  const snapping = useSelector((s) => s.ui.snapping)
  const design = useSelector((s) => s.design)
  const selectedIds = useSelector((s) => s.selection.ids)
  const selectedImage = selectedIds.length === 1 && design.elements[selectedIds[0]]?.type === 'image' ? design.elements[selectedIds[0]] : null
  const [exportOpen, setExportOpen] = useState(false)
  const add = (payload) => {
    const element = make(payload)
    dispatch(addElement(element))
    dispatch(selectElement(element.id))
    const after = structuredClone({ ...design, elements: { ...design.elements, [element.id]: element }, elementOrder: [...design.elementOrder, element.id] })
    dispatch(pushHistory({ before: structuredClone(design), after }))
  }
  return <div className="flex h-12 items-center gap-1 border-b border-white/10 bg-[#101216] px-3">
    <button onClick={onHome} className="mr-3 flex items-center gap-2 rounded-lg px-1 py-1 transition hover:bg-white/5" title="Back to dashboard"><div className="grid h-7 w-7 place-items-center rounded-lg bg-blue-500 text-xs font-black text-white">L</div><span className="text-left"><span className="block text-sm font-semibold">Layer Studio</span><span className="block max-w-36 truncate text-[10px] font-normal text-slate-500">{projectName || "Untitled design"}</span></span></button>
    <div className="h-5 w-px bg-white/10" />
    <button onClick={onHome} className="toolbar-btn" title="Dashboard"><Home size={16}/></button>
    <button onClick={() => add({ type: 'text', name: 'Text', text: 'Double-click to edit', x: 120, y: 120, width: 420, fontFamily: 'Inter', fontSize: 64, fontWeight: 700, fill: '#111827' })} className="toolbar-btn" title="Add text"><Type size={16}/></button>
    <button onClick={() => add({ type: 'rect', name: 'Rectangle', x: 160, y: 160, width: 300, height: 180, fill: '#dbeafe', cornerRadius: 16 })} className="toolbar-btn" title="Add rectangle"><Square size={16}/></button>
    <button onClick={() => add({ type: 'circle', name: 'Circle', x: 260, y: 240, width: 180, height: 180, radius: 90, fill: '#f5d0fe' })} className="toolbar-btn" title="Add circle"><CircleIcon size={16}/></button>
    <label className="toolbar-btn" title="Add image or SVG"><ImagePlus size={16}/><input type="file" accept="image/*,.svg" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; e.target.value = ''; if (!file) return; try { const result = await api.uploadImage(file); const src = result.asset.url.startsWith('http') ? result.asset.url : `${API_URL.replace(/\/api$/, '')}${result.asset.url}`; add({ type: result.asset.type === 'svg' ? 'svg' : 'image', assetId: result.asset.id, name: result.asset.name, src, x: 180, y: 180, width: Math.min(420, result.asset.width), height: Math.min(420, result.asset.height), mimeType: result.asset.mimeType }) } catch (error) { window.alert(error.message) } }} /></label>
    <div className="ml-2 h-5 w-px bg-white/10" />
    <button onClick={onUndo} className="toolbar-btn" title="Undo"><Undo2 size={16}/></button>
    <button onClick={onRedo} className="toolbar-btn" title="Redo"><Redo2 size={16}/></button>
    <div className="ml-auto flex items-center gap-3"><span className="flex items-center gap-1.5 text-[10px] text-slate-500"><Cloud size={12}/> {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'error' ? 'Save failed' : 'Saved'}</span><div className="h-5 w-px bg-white/10" /><div className="relative"><button onClick={() => setExportOpen((value) => !value)} className="toolbar-btn flex items-center gap-1 px-2" title="Download design"><Download size={15}/><span className="text-xs">Download</span><ChevronDown size={13}/></button>{exportOpen && <div className="absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#171a20] p-1 shadow-2xl"><button onClick={() => { exportRaster(stageRef.current, design, 'png', zoom); setExportOpen(false) }} className="export-menu-btn"><FileImage size={15}/><span><b>PNG</b><small>High-quality image</small></span></button><button onClick={() => { exportRaster(stageRef.current, design, 'jpg', zoom); setExportOpen(false) }} className="export-menu-btn"><FileImage size={15}/><span><b>JPG</b><small>Compressed image</small></span></button><button onClick={async () => { try { await exportSvg(design); setExportOpen(false) } catch (error) { window.alert(error.message) } }} className="export-menu-btn"><FileCode2 size={15}/><span><b>SVG</b><small>Editable vector</small></span></button><button disabled={!selectedImage} onClick={async () => { try { await exportSelectedImage(selectedImage); setExportOpen(false) } catch (error) { window.alert(error.message) } }} className="export-menu-btn disabled:cursor-not-allowed disabled:opacity-40"><ImageIcon size={15}/><span><b>Selected image</b><small>{selectedImage ? 'Download image asset' : 'Select an image layer'}</small></span></button><button onClick={() => { exportJson(design); setExportOpen(false) }} className="export-menu-btn"><FileCode2 size={15}/><span><b>Design JSON</b><small>Editable DesignDocument</small></span></button></div>}</div><button onClick={() => dispatch(setSnapping(!snapping))} className={`toolbar-btn flex items-center gap-1 px-2 ${snapping ? 'bg-blue-500/15 text-blue-300' : ''}`} title="Toggle snapping">Snap</button><button onClick={() => dispatch(setZoom(Math.max(.25, zoom - .1)))} className="toolbar-btn"><ZoomOut size={15}/></button><span className="w-12 text-center text-xs text-slate-400">{Math.round(zoom * 100)}%</span><button onClick={() => dispatch(setZoom(Math.min(1.5, zoom + .1)))} className="toolbar-btn"><ZoomIn size={15}/></button><button onClick={onLogout} className="toolbar-btn" title="Sign out"><LogOut size={15}/></button></div>
  </div>
}
