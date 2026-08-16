import { useCallback, useEffect, useRef, useState } from 'react'
import { Bot, ImageIcon, Keyboard, Layers3, LogOut, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import CanvasEditor from './components/canvas/CanvasEditor.jsx'
import LayerPanel from './components/layers/LayerPanel.jsx'
import AIDesignerPanel from './components/ai/AIDesignerPanel.jsx'
import AssetPanel from './components/assets/AssetPanel.jsx'
import PropertiesPanel from './components/properties/PropertiesPanel.jsx'
import Toolbar from './components/toolbar/Toolbar.jsx'
import AuthScreen from './components/auth/AuthScreen.jsx'
import Dashboard from './components/dashboard/Dashboard.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { createDefaultDocument, normalizeDesignDocument } from './types/design.js'
import { replaceDocument } from './store/slices/designSlice.js'
import { clearHistory } from './store/slices/historySlice.js'
import { clearSelection } from './store/slices/selectionSlice.js'
import { authFailed, logout, setCredentials } from './store/slices/authSlice.js'
import { clearDocumentMeta, setDocumentMeta, setSaveError, setSaveStatus } from './store/slices/documentMetaSlice.js'
import { api } from './services/api.js'
import { undo, redo } from './utils/history.js'

function getRoute() {
  const match = window.location.pathname.match(/^\/editor\/([^/]+)$/)
  return match ? { view: 'editor', id: match[1] } : { view: 'dashboard', id: null }
}

function PanelTab({ active, onClick, icon: Icon, label }) {
  return <button onClick={onClick} aria-pressed={active} className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2 text-[11px] font-medium transition ${active ? 'bg-blue-500/15 text-blue-300' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`} title={label}><Icon size={15}/><span className="hidden xl:inline">{label}</span></button>
}

export default function App() {
  const dispatch = useDispatch()
  const auth = useSelector((s) => s.auth)
  const design = useSelector((s) => s.design)
  const canUndo = useSelector((s) => s.history.past.length > 0)
  const canRedo = useSelector((s) => s.history.future.length > 0)
  const documentMeta = useSelector((s) => s.documentMeta)
  const [route, setRoute] = useState(getRoute)
  const [bootstrapping, setBootstrapping] = useState(true)
  const [bootstrapError, setBootstrapError] = useState(null)
  const [leftPanel, setLeftPanel] = useState('layers')
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const hydrated = useRef(false)
  const stageRef = useRef(null)
  const bootstrapStarted = useRef(false)

  const navigate = useCallback((path) => {
    window.history.pushState({}, '', path)
    setRoute(getRoute())
  }, [])

  useEffect(() => {
    const onPopState = () => setRoute(getRoute())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (bootstrapStarted.current) return
    bootstrapStarted.current = true
    setBootstrapping(true)
    setBootstrapError(null)
    ;(async () => {
      try {
        const meResult = await api.me()
        dispatch(setCredentials({ user: meResult.user }))
      } catch (error) {
        setBootstrapError(null)
        dispatch(authFailed())
      } finally {
        setBootstrapping(false)
      }
    })()
  }, [dispatch])

  useEffect(() => {
    if (auth.status !== 'authenticated' || route.view !== 'editor' || !route.id) return
    let cancelled = false
    hydrated.current = false
    setBootstrapError(null)
    ;(async () => {
      try {
        const result = await api.getDesign(route.id)
        if (cancelled) return
        dispatch(replaceDocument(normalizeDesignDocument(result.design.document)))
        dispatch(setDocumentMeta(result.design))
        dispatch(clearHistory())
        dispatch(clearSelection())
        hydrated.current = true
      } catch (error) {
        if (!cancelled) {
          setBootstrapError(error.message)
          navigate('/')
        }
      }
    })()
    return () => { cancelled = true }
  }, [auth.status, route.view, route.id, dispatch, navigate])

  useEffect(() => {
    if (!hydrated.current || !documentMeta.id || route.view !== 'editor') return
    dispatch(setSaveStatus('saving'))
    const timer = window.setTimeout(async () => {
      try {
        const result = await api.updateDesign(documentMeta.id, { document: design, name: documentMeta.name })
        dispatch(setDocumentMeta(result.design))
      } catch (error) {
        dispatch(setSaveError(error.message))
      }
    }, 800)
    return () => window.clearTimeout(timer)
  }, [design, documentMeta.id, documentMeta.name, route.view, dispatch])

  const openProject = (id) => navigate(`/editor/${id}`)
  const goHome = () => { hydrated.current = false; dispatch(clearDocumentMeta()); dispatch(clearHistory()); dispatch(clearSelection()); navigate('/') }
  const signOut = async () => { hydrated.current = false; bootstrapStarted.current = true; try { await api.logout() } catch {} dispatch(clearDocumentMeta()); dispatch(clearHistory()); dispatch(clearSelection()); dispatch(logout()); navigate('/') }

  useEffect(() => {
    const handler = (event) => {
      if (route.view !== 'editor') return
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        event.shiftKey ? redo(dispatch, () => window.__editorStore.getState()) : undo(dispatch, () => window.__editorStore.getState())
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        redo(dispatch, () => window.__editorStore.getState())
      }
      if (event.key === '[') setLeftOpen((value) => !value)
      if (event.key === ']') setRightOpen((value) => !value)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dispatch, route.view])

  if (auth.status === 'signedOut') return <AuthScreen />
  if (bootstrapping || auth.status === 'checking') return <div className="grid h-screen place-items-center bg-[#0f1115] text-center text-sm text-slate-500"><div><div className="animate-pulse">Loading your workspace…</div>{bootstrapError && <div className="mt-2 text-red-400">{bootstrapError}</div>}</div></div>
  if (route.view === 'dashboard') return <Dashboard onOpenProject={openProject} onLogout={signOut} />
  if (!documentMeta.id) return <div className="grid h-screen place-items-center bg-[#0f1115] text-sm text-slate-500"><div className="animate-pulse">Loading project…</div></div>

  return <ErrorBoundary><div className="flex h-screen min-h-0 flex-col bg-[#0f1115] text-slate-200">
    <Toolbar stageRef={stageRef} onHome={goHome} onUndo={() => canUndo && undo(dispatch, () => window.__editorStore.getState())} onRedo={() => canRedo && redo(dispatch, () => window.__editorStore.getState())} onLogout={signOut} saveStatus={documentMeta.status} projectName={documentMeta.name} />
    <div className="flex min-h-0 flex-1">
      <aside className={`min-h-0 shrink-0 overflow-hidden border-r border-white/10 bg-[#121419] transition-[width] duration-200 ${leftOpen ? 'w-[250px]' : 'w-11'}`}>
        <div className="flex h-11 items-center gap-1 border-b border-white/10 px-1">
          <PanelTab active={leftOpen && leftPanel === 'ai'} onClick={() => { setLeftOpen(true); setLeftPanel('ai') }} icon={Bot} label="AI" />
          <PanelTab active={leftOpen && leftPanel === 'assets'} onClick={() => { setLeftOpen(true); setLeftPanel('assets') }} icon={ImageIcon} label="Assets" />
          <PanelTab active={leftOpen && leftPanel === 'layers'} onClick={() => { setLeftOpen(true); setLeftPanel('layers') }} icon={Layers3} label="Layers" />
          <button onClick={() => setLeftOpen((value) => !value)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-slate-200" title={leftOpen ? 'Collapse left panel ([)' : 'Expand left panel ([)'}>{leftOpen ? <PanelLeftClose size={15}/> : <PanelLeftOpen size={15}/>}</button>
        </div>
        {leftOpen && <div className="h-[calc(100%-44px)] overflow-y-auto scrollbar-thin">{leftPanel === 'ai' && <AIDesignerPanel />}{leftPanel === 'assets' && <AssetPanel />}{leftPanel === 'layers' && <LayerPanel />}</div>}
      </aside>

      <main className="min-w-0 flex-1"><CanvasEditor stageRef={stageRef} /></main>

      <aside className={`relative min-h-0 shrink-0 overflow-hidden border-l border-white/10 bg-[#121419] transition-[width] duration-200 ${rightOpen ? 'w-[300px]' : 'w-11'}`}>
        <div className="flex h-11 items-center justify-end border-b border-white/10 px-1"><button onClick={() => setRightOpen((value) => !value)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-slate-200" title={rightOpen ? 'Collapse properties panel (])' : 'Expand properties panel (])'}>{rightOpen ? <PanelRightClose size={15}/> : <PanelRightOpen size={15}/>}</button></div>
        {rightOpen && <div className="h-[calc(100%-44px)] overflow-y-auto scrollbar-thin"><PropertiesPanel /></div>}
      </aside>
    </div>
    <div className="flex h-7 shrink-0 items-center justify-between gap-3 border-t border-white/10 bg-[#101216] px-3 text-[10px] text-slate-500"><span className="hidden sm:block">{documentMeta.status === 'saving' ? 'Saving changes…' : documentMeta.status === 'error' ? 'Save failed — retrying on next change' : documentMeta.lastSavedAt ? `Saved ${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(documentMeta.lastSavedAt))}` : 'Ready'}</span><span className="flex items-center gap-1.5"><Keyboard size={12}/> Ctrl/Cmd+Z undo · Shift+Z redo · Shift+click multi-select · Space+drag pan · [ / ] panels</span></div>
  </div></ErrorBoundary>
}
