import { useState } from 'react'
import { Bot, Check, Image as ImageIcon, Sparkles, WandSparkles } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { addElement, replaceDocument } from '../../store/slices/designSlice.js'
import { clearHistory, pushHistory } from '../../store/slices/historySlice.js'
import { clearSelection, selectElement } from '../../store/slices/selectionSlice.js'
import { updateAiCredits } from '../../store/slices/authSlice.js'
import { api, API_URL } from '../../services/api.js'

const clone = (value) => structuredClone(value)

export default function AIDesignerPanel() {
  const dispatch = useDispatch()
  const design = useSelector((state) => state.design)
  const aiCredits = useSelector((state) => state.auth.user?.aiCredits ?? 0)
  const selectedIds = useSelector((state) => state.selection.ids)
  const selectedCount = selectedIds.length
  const [mode, setMode] = useState('generate')
  const [imageSize, setImageSize] = useState('1024x1024')
  const [imageQuality, setImageQuality] = useState('low')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const cost = mode === 'image' ? 5 : 1
  const hasCredits = aiCredits >= cost

  const syncCredits = (result) => {
    if (typeof result?.credits?.remaining === 'number') dispatch(updateAiCredits(result.credits.remaining))
  }

  const generate = async () => {
    if (!prompt.trim() || loading || !hasCredits) return
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const result = await api.generateDesign({ prompt: prompt.trim(), canvas: { width: design.canvas.width, height: design.canvas.height } })
      syncCredits(result)
      dispatch(replaceDocument(result.document))
      dispatch(clearHistory())
      dispatch(clearSelection())
      setMessage('Design generated. Every returned element is editable.')
      setPrompt('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const modify = async () => {
    if (!prompt.trim() || loading || !hasCredits) return
    setLoading(true)
    setError('')
    setMessage('')
    const before = clone(design)
    try {
      const result = await api.modifyDesign({ instruction: prompt.trim(), selectedIds, design })
      syncCredits(result)
      const after = applyOperationsLocally(before, result.operations)
      dispatch(replaceDocument(after))
      dispatch(pushHistory({ before, after }))
      setMessage(result.summary || 'AI changes applied.')
      setPrompt('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const generateImage = async () => {
    if (!prompt.trim() || loading || !hasCredits) return
    setLoading(true); setError(''); setMessage('')
    try {
      const result = await api.generateImage({ prompt: prompt.trim(), size: imageSize, quality: imageQuality })
      syncCredits(result)
      const asset = result.asset
      const serverOrigin = apiServerOrigin()
      const src = asset.url.startsWith('http') ? asset.url : `${serverOrigin}${asset.url}`
      const max = 420
      const scale = Math.min(1, max / Math.max(asset.width, asset.height))
      const width = Math.max(1, Math.round(asset.width * scale))
      const height = Math.max(1, Math.round(asset.height * scale))
      const element = { id: crypto.randomUUID(), type: 'image', assetId: asset.id, name: asset.name, src, mimeType: asset.mimeType, x: Math.max(0, Math.round((design.canvas.width - width) / 2)), y: Math.max(0, Math.round((design.canvas.height - height) / 2)), width, height, rotation: 0, opacity: 1, visible: true, locked: false }
      const before = clone(design)
      const after = clone(design); after.elements[element.id] = element; after.elementOrder.push(element.id)
      dispatch(addElement(element)); dispatch(selectElement(element.id)); dispatch(pushHistory({ before, after })); window.dispatchEvent(new Event('assets:changed'))
      setMessage('AI image generated and added as an editable image layer.')
      setPrompt('')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const submit = mode === 'generate' ? generate : mode === 'modify' ? modify : generateImage

  return (
    <section className="border-b border-white/10 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-200">
        <Bot size={15} className="text-violet-400" /> AI DESIGNER
      </div>
      <div className="mb-2 flex items-center justify-between rounded-lg border border-white/10 bg-[#0d0f13] px-2.5 py-2">
        <div>
          <div className="text-[9px] uppercase tracking-wide text-slate-500">AI Credits</div>
          <div className="text-xs font-semibold text-slate-200">{aiCredits} remaining</div>
        </div>
        <div className="rounded-md bg-violet-500/10 px-2 py-1 text-[9px] text-violet-300">{cost} credit{cost === 1 ? '' : 's'} / run</div>
      </div>
      <div className="mb-2 grid grid-cols-3 rounded-lg bg-[#0d0f13] p-1 text-[10px]">
        <button type="button" onClick={() => { setMode('generate'); setError(''); setMessage('') }} className={`rounded-md px-2 py-1.5 ${mode === 'generate' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Design</button>
        <button type="button" onClick={() => { setMode('modify'); setError(''); setMessage('') }} className={`rounded-md px-2 py-1.5 ${mode === 'modify' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Modify</button>
        <button type="button" onClick={() => { setMode('image'); setError(''); setMessage('') }} className={`rounded-md px-2 py-1.5 ${mode === 'image' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Image</button>
      </div>
      {mode === 'modify' && (
        <div className="mb-2 flex items-center gap-1.5 text-[10px] text-slate-500">
          <Check size={12} className="text-emerald-400" />
          {selectedCount ? `${selectedCount} selected layer${selectedCount === 1 ? '' : 's'}` : 'No layer selected — AI will inspect the design'}
        </div>
      )}
      {!hasCredits && <div className="mb-2 rounded-md bg-amber-500/10 p-2 text-[10px] leading-4 text-amber-300">You have no AI credits remaining. AI is unavailable until more credits are added.</div>}
      <p className="mb-2 text-[11px] leading-4 text-slate-500">
        {mode === 'generate' ? 'Describe the design you want. The AI returns editable layers, not a flattened image.' : mode === 'modify' ? 'Describe a change. AI returns only the operations needed to modify the existing layers.' : 'Generate a raster image asset. It will be saved to your asset library and inserted as an editable image layer.'}
      </p>
      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') submit() }}
        placeholder={mode === 'generate' ? 'Create an Instagram post for a coffee shop...' : mode === 'modify' ? 'Make the title bigger and move it slightly down...' : 'A realistic ceramic coffee cup on a warm beige table, editorial product photography...'}
        rows={5}
        className="w-full resize-none rounded-lg border border-white/10 bg-[#0d0f13] p-2 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-violet-500/60"
      />
      {mode === 'image' && <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="text-[10px] text-slate-500">Size<select value={imageSize} onChange={(e) => setImageSize(e.target.value)} className="mt-1 w-full rounded-md border border-white/10 bg-[#0d0f13] px-2 py-1.5 text-[10px] text-slate-300 outline-none"><option value="1024x1024">Square</option><option value="1024x1536">Portrait</option><option value="1536x1024">Landscape</option></select></label>
        <label className="text-[10px] text-slate-500">Quality<select value={imageQuality} onChange={(e) => setImageQuality(e.target.value)} className="mt-1 w-full rounded-md border border-white/10 bg-[#0d0f13] px-2 py-1.5 text-[10px] text-slate-300 outline-none"><option value="low">Low — cheaper</option><option value="medium">Medium</option><option value="high">High</option></select></label>
      </div>}
      <button type="button" onClick={submit} disabled={loading || !prompt.trim() || !hasCredits} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40">
        {loading ? <Sparkles size={14} className="animate-pulse" /> : mode === 'image' ? <ImageIcon size={14} /> : <WandSparkles size={14} />}
        {loading ? 'Working…' : mode === 'generate' ? 'Generate Design' : mode === 'modify' ? 'Modify Design' : 'Generate Image'}
      </button>
      <div className="mt-1 text-center text-[9px] text-slate-600">Ctrl/Cmd + Enter to run</div>
      {message && <div className="mt-2 rounded-md bg-emerald-500/10 p-2 text-[10px] leading-4 text-emerald-300">{message}</div>}
      {error && <div className="mt-2 rounded-md bg-red-500/10 p-2 text-[10px] leading-4 text-red-300">{error}</div>}
    </section>
  )
}

function apiServerOrigin() { return API_URL.replace(/\/api$/, '') }

function applyOperationsLocally(document, operations) {
  const next = clone(document)
  for (const operation of operations) {
    switch (operation.action) {
      case 'add': next.elements[operation.element.id] = clone(operation.element); next.elementOrder.push(operation.element.id); break
      case 'update': if (next.elements[operation.elementId]) Object.assign(next.elements[operation.elementId], Object.fromEntries(Object.entries(operation.changes || {}).filter(([, value]) => value !== null))); break
      case 'delete': delete next.elements[operation.elementId]; next.elementOrder = next.elementOrder.filter((id) => id !== operation.elementId); break
      case 'move': if (next.elements[operation.elementId]) { next.elements[operation.elementId].x = operation.x; next.elements[operation.elementId].y = operation.y } break
      case 'duplicate': { const source = next.elements[operation.elementId]; if (source) { next.elements[operation.newElementId] = { ...clone(source), ...(operation.changes || {}), id: operation.newElementId, x: (source.x || 0) + 24, y: (source.y || 0) + 24 }; const index = next.elementOrder.indexOf(operation.elementId); next.elementOrder.splice(index + 1, 0, operation.newElementId) } break }
      case 'group': { const ids = [...new Set(operation.elementIds || [])]; const first = next.elementOrder.indexOf(ids[0]); next.elements[operation.groupId] = { id: operation.groupId, type: 'group', name: operation.name || 'Group', x: 0, y: 0, rotation: 0, opacity: 1, visible: true, locked: false, children: ids }; next.elementOrder.splice(Math.max(first, 0), 0, operation.groupId); break }
      case 'ungroup': { delete next.elements[operation.groupId]; next.elementOrder = next.elementOrder.filter((id) => id !== operation.groupId); break }
      case 'reorder': { const order = next.elementOrder.filter((id) => id !== operation.elementId); order.splice(Math.min(Math.max(operation.toIndex, 0), order.length), 0, operation.elementId); next.elementOrder = order; break }
      default: break
    }
  }
  return next
}
