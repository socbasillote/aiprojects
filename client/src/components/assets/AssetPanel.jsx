import { useEffect, useRef, useState } from 'react'
import { ImagePlus, RefreshCw, Trash2, Upload } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { addElement, updateElement } from '../../store/slices/designSlice.js'
import { selectElement } from '../../store/slices/selectionSlice.js'
import { pushHistory } from '../../store/slices/historySlice.js'
import { api, API_URL } from '../../services/api.js'

const serverOrigin = API_URL.replace(/\/api$/, '')
const publicUrl = (url) => url?.startsWith('http') ? url : `${serverOrigin}${url}`

function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => { URL.revokeObjectURL(objectUrl); resolve({ width: image.naturalWidth || image.width, height: image.naturalHeight || image.height }) }
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Unable to read image dimensions')) }
    image.src = objectUrl
  })
}

const fitSize = (width, height, max = 420) => {
  const scale = Math.min(1, max / Math.max(width, height))
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) }
}

export default function AssetPanel() {
  const dispatch = useDispatch()
  const inputRef = useRef(null)
  const design = useSelector((s) => s.design)
  const selectedId = useSelector((s) => s.selection.ids[0])
  const selectedElement = selectedId ? design.elements[selectedId] : null
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const loadAssets = async () => {
    setLoading(true); setError('')
    try { const result = await api.listAssets(); setAssets(result.assets) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => {
    loadAssets()
    const refresh = () => loadAssets()
    window.addEventListener('assets:changed', refresh)
    return () => window.removeEventListener('assets:changed', refresh)
  }, [])

  const insertAsset = (asset) => {
    const size = fitSize(asset.width, asset.height)
    const element = { id: crypto.randomUUID(), type: asset.type === 'svg' ? 'svg' : 'image', assetId: asset.id, name: asset.name, src: publicUrl(asset.url), mimeType: asset.mimeType, x: Math.max(0, Math.round((design.canvas.width - size.width) / 2)), y: Math.max(0, Math.round((design.canvas.height - size.height) / 2)), width: size.width, height: size.height, rotation: 0, opacity: 1, visible: true, locked: false }
    const after = structuredClone(design); after.elements[element.id] = element; after.elementOrder.push(element.id)
    dispatch(addElement(element)); dispatch(selectElement(element.id)); dispatch(pushHistory({ before: structuredClone(design), after }))
  }

  const replaceSelected = (asset) => {
    if (!selectedElement || !['image', 'svg'].includes(selectedElement.type)) return
    const before = structuredClone(design)
    const changes = { type: asset.type === 'svg' ? 'svg' : 'image', assetId: asset.id, name: asset.name, src: publicUrl(asset.url), mimeType: asset.mimeType }
    const after = structuredClone(design); Object.assign(after.elements[selectedElement.id], changes)
    dispatch(updateElement({ id: selectedElement.id, changes })); dispatch(pushHistory({ before, after }))
  }

  const handleUpload = async (file) => {
    if (!file) return
    setUploading(true); setError('')
    try { const dimensions = await getImageDimensions(file); const result = await api.uploadImage(file, dimensions.width, dimensions.height); setAssets((current) => [result.asset, ...current]); insertAsset(result.asset) }
    catch (err) { setError(err.message) }
    finally { setUploading(false) }
  }

  const deleteAsset = async (asset) => {
    if (!window.confirm(`Delete “${asset.name}” from your asset library?`)) return
    try { await api.deleteAsset(asset.id); setAssets((current) => current.filter((item) => item.id !== asset.id)) }
    catch (err) { setError(err.message) }
  }

  return <section className="border-b border-white/10">
    <div className="flex items-center justify-between px-4 py-3"><div className="text-[11px] font-semibold tracking-[.14em] text-slate-400">ASSETS</div><button onClick={loadAssets} className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-200" title="Refresh assets"><RefreshCw size={13} className={loading ? 'animate-spin' : ''}/></button></div>
    <div className="px-3 pb-3">
      <button onClick={() => inputRef.current?.click()} disabled={uploading} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[.02] px-3 py-2.5 text-xs text-slate-300 hover:border-blue-500/50 hover:bg-blue-500/5 disabled:opacity-50">{uploading ? <RefreshCw size={14} className="animate-spin"/> : <Upload size={14}/>} {uploading ? 'Uploading…' : 'Upload image or SVG'}</button>
      <input ref={inputRef} type="file" accept="image/*,.svg" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ''; handleUpload(file) }} />
      {['image', 'svg'].includes(selectedElement?.type) && <div className="mt-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-2.5 py-2 text-[10px] text-blue-200">Click an asset below to replace the selected image.</div>}
      {error && <div className="mt-2 rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-2 text-[10px] leading-4 text-red-300">{error}</div>}
    </div>
    <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto px-3 pb-3 scrollbar-thin">
      {assets.map((asset) => <div key={asset.id} className="group relative overflow-hidden rounded-lg border border-white/10 bg-[#181b21]"><button onClick={() => ['image', 'svg'].includes(selectedElement?.type) ? replaceSelected(asset) : insertAsset(asset)} className="block w-full text-left" title={['image', 'svg'].includes(selectedElement?.type) ? 'Replace selected asset' : 'Add to canvas'}><div className="aspect-square bg-[#111318] p-1.5"><img src={publicUrl(asset.url)} alt={asset.name} className="h-full w-full object-contain" loading="lazy" /></div><div className="truncate px-2 py-1.5 text-[10px] text-slate-400">{asset.name}</div></button><button onClick={() => deleteAsset(asset)} className="absolute right-1.5 top-1.5 rounded-md bg-black/70 p-1.5 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-500/80" title="Delete asset"><Trash2 size={12}/></button></div>)}
      {!loading && assets.length === 0 && <div className="col-span-2 py-6 text-center text-[10px] text-slate-600"><ImagePlus size={18} className="mx-auto mb-2"/>No assets yet.</div>}
    </div>
  </section>
}
