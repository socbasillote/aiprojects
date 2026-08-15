import { useState } from 'react'
import { Layers3, LogIn, UserPlus } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { api } from '../../services/api.js'
import { setCredentials } from '../../store/slices/authSlice.js'

export default function AuthScreen() {
  const dispatch = useDispatch()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = mode === 'login' ? await api.login({ email: form.email, password: form.password }) : await api.register(form)
      dispatch(setCredentials(result))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  return <div className="grid min-h-screen place-items-center bg-[#0f1115] px-4 text-slate-200">
    <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#15181e] p-7 shadow-2xl">
      <div className="mb-7 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500"><Layers3 size={20}/></div><div><h1 className="text-lg font-semibold">Layer Studio</h1><p className="text-xs text-slate-500">AI-native graphics editor</p></div></div>
      <div className="mb-5 flex rounded-lg bg-black/20 p-1"><button type="button" onClick={() => setMode('login')} className={`flex-1 rounded-md px-3 py-2 text-sm ${mode === 'login' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>Sign in</button><button type="button" onClick={() => setMode('register')} className={`flex-1 rounded-md px-3 py-2 text-sm ${mode === 'register' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>Create account</button></div>
      {mode === 'register' && <div className="grid grid-cols-2 gap-3"><label className="text-xs text-slate-400">First name<input value={form.firstName} onChange={update('firstName')} className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm outline-none focus:border-blue-500" required minLength={2}/></label><label className="text-xs text-slate-400">Last name<input value={form.lastName} onChange={update('lastName')} className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm outline-none focus:border-blue-500" required minLength={2}/></label></div>}
      <div className="mt-3"><label className="text-xs text-slate-400">Email<input type="email" value={form.email} onChange={update('email')} className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm outline-none focus:border-blue-500" required/></label></div>
      <div className="mt-3"><label className="text-xs text-slate-400">Password<input type="password" value={form.password} onChange={update('password')} className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm outline-none focus:border-blue-500" required minLength={mode === 'register' ? 8 : 1}/></label></div>
      {error && <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>}
      <button disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{mode === 'login' ? <LogIn size={16}/> : <UserPlus size={16}/>} {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
    </form>
  </div>
}
