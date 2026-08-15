import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Keyboard } from 'lucide-react'
import CanvasEditor from './components/canvas/CanvasEditor.jsx'
import LayerPanel from './components/layers/LayerPanel.jsx'
import AIDesignerPanel from './components/ai/AIDesignerPanel.jsx'
import AssetPanel from './components/assets/AssetPanel.jsx'
import PropertiesPanel from './components/properties/PropertiesPanel.jsx'
import Toolbar from './components/toolbar/Toolbar.jsx'
import AuthScreen from './components/auth/AuthScreen.jsx'
import Dashboard from './components/dashboard/Dashboard.jsx'
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

export default function App() {
  const dispatch = useDispatch()
  const auth = useSelector((s) => s.auth)
  const design = useSelector((s) => s.design)
  const canUndo = useSelector((s) => s.history.past.length > 0)
  const canRedo = useSelector((s) => s.history.future.length > 0)
  const documentMeta = useSelector((s) => s.documentMeta)
  const [route, setRoute] = useState(getRoute)
  const [bootstrapping, setBootstrapping] = useState(Boolean(auth.token))
  const [bootstrapError, setBootstrapError] = useState(null)
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
    if (!auth.token || bootstrapStarted.current) return
    bootstrapStarted.current = true
    setBootstrapping(true)
    setBootstrapError(null)
    ;(async () => {
      try {
        const meResult = await api.me()
        dispatch(setCredentials({ token: auth.token, user: meResult.user }))
        const result = await api.listDesigns()
        if (!result.designs.length) {
          await api.createDesign({ name: 'Untitled design', document: createDefaultDocument() })
        }
      } catch (error) {
        localStorage.removeItem('editor_token')
        localStorage.removeItem('editor_user')
        setBootstrapError(error.message)
        dispatch(authFailed(error.message))
      } finally {
        setBootstrapping(false)
      }
    })()
  }, [auth.token, dispatch])

  useEffect(() => {
    if (!auth.token || auth.status !== 'authenticated' || route.view !== 'editor' || !route.id) return
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
  }, [auth.token, auth.status, route.view, route.id, dispatch, navigate])

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
  const signOut = () => { hydrated.current = false; bootstrapStarted.current = false; dispatch(clearDocumentMeta()); dispatch(clearHistory()); dispatch(clearSelection()); dispatch(logout()); navigate('/') }

  useEffect(() => {
    const handler = (event) => {
      if (!(event.metaKey || event.ctrlKey) || route.view !== 'editor') return
      if (event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo(dispatch, () => window.__editorStore.getState()) : undo(dispatch, () => window.__editorStore.getState()) }
      if (event.key.toLowerCase() === 'y') { event.preventDefault(); redo(dispatch, () => window.__editorStore.getState()) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dispatch, route.view])

  if (auth.status === 'signedOut') return <AuthScreen />
  if (bootstrapping || auth.status === 'checking') return <div className="grid h-screen place-items-center bg-[#0f1115] text-center text-sm text-slate-500"><div><div>Loading your workspace…</div>{bootstrapError && <div className="mt-2 text-red-400">{bootstrapError}</div>}</div></div>

  if (route.view === 'dashboard') return <Dashboard onOpenProject={openProject} onLogout={signOut} />

  if (!documentMeta.id) return <div className="grid h-screen place-items-center bg-[#0f1115] text-sm text-slate-500">Loading project…</div>

  return <div className="flex h-screen min-h-0 flex-col bg-[#0f1115] text-slate-200">
    <Toolbar stageRef={stageRef} onHome={goHome} onUndo={() => canUndo && undo(dispatch, () => window.__editorStore.getState())} onRedo={() => canRedo && redo(dispatch, () => window.__editorStore.getState())} onLogout={signOut} saveStatus={documentMeta.status} projectName={documentMeta.name} />
    <div className="grid min-h-0 flex-1 grid-cols-[230px_minmax(0,1fr)_280px]">
      <aside className="min-h-0 overflow-y-auto border-r border-white/10 bg-[#121419]"><AIDesignerPanel /><AssetPanel /><div className="flex h-10 items-center gap-2 border-b border-white/10 px-4 text-xs text-slate-400"><span className="h-2 w-2 rounded-full bg-blue-500"/> Layers</div><LayerPanel /></aside>
      <main className="min-h-0"><CanvasEditor stageRef={stageRef} /></main>
      <aside className="min-h-0 border-l border-white/10 bg-[#121419]"><PropertiesPanel /></aside>
    </div>
    <div className="flex h-7 items-center justify-end gap-2 border-t border-white/10 bg-[#101216] px-3 text-[10px] text-slate-500"><Keyboard size={12}/> Ctrl/Cmd + Z undo · Shift + Z redo · Double-click text to edit</div>
  </div>
}
