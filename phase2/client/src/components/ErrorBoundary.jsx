import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, message: '' }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Something went wrong.' }
  }

  componentDidCatch(error) {
    console.error('Editor error boundary:', error)
  }

  reset = () => this.setState({ hasError: false, message: '' })

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="grid min-h-screen place-items-center bg-[#0f1115] p-6 text-slate-200">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#15181e] p-6 text-center shadow-2xl">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-500/10 text-red-300"><AlertTriangle size={22} /></div>
          <h1 className="mt-4 text-lg font-semibold text-white">The editor hit an unexpected error</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{this.state.message}</p>
          <button onClick={this.reset} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100"><RefreshCw size={14} /> Try again</button>
        </div>
      </div>
    )
  }
}
