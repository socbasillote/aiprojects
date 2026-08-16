import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, CreditCard, Loader2, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { updateAiCredits } from '../../store/slices/authSlice.js'
import { api } from '../../services/api.js'

const SDK_ID = 'paypal-js-sdk'

function loadPayPalSdk(clientId) {
  return new Promise((resolve, reject) => {
    if (window.paypal?.Buttons) return resolve(window.paypal)
    const existing = document.getElementById(SDK_ID)
    if (existing) {
      existing.addEventListener('load', () => resolve(window.paypal), { once: true })
      existing.addEventListener('error', () => reject(new Error('Unable to load PayPal Checkout.')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.id = SDK_ID
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&components=buttons`
    script.async = true
    script.onload = () => window.paypal ? resolve(window.paypal) : reject(new Error('PayPal Checkout loaded without the PayPal SDK.'))
    script.onerror = () => reject(new Error('Unable to load PayPal Checkout. Check your internet connection and PayPal client ID.'))
    document.head.appendChild(script)
  })
}

export default function CreditPurchaseModal({ onClose }) {
  const dispatch = useDispatch()
  const currentCredits = useSelector((state) => state.auth.user?.aiCredits ?? 0)
  const [packages, setPackages] = useState([])
  const [selectedId, setSelectedId] = useState('creator')
  const [clientId, setClientId] = useState('')
  const [loadingPackages, setLoadingPackages] = useState(true)
  const [sdkError, setSdkError] = useState('')
  const [success, setSuccess] = useState(null)
  const buttonContainerRef = useRef(null)
  const paypalButtonsRef = useRef(null)

  const selectedPackage = packages.find((item) => item.id === selectedId) || packages[0]

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const result = await api.getBillingPackages()
        if (cancelled) return
        setPackages(result.packages || [])
        setClientId(result.clientId || '')
        if (result.packages?.some((item) => item.id === 'creator')) setSelectedId('creator')
        else if (result.packages?.[0]) setSelectedId(result.packages[0].id)
      } catch (error) {
        if (!cancelled) setSdkError(error.message)
      } finally {
        if (!cancelled) setLoadingPackages(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!clientId || !selectedPackage || !buttonContainerRef.current || success) return
    let cancelled = false
    const container = buttonContainerRef.current
    container.innerHTML = ''
    paypalButtonsRef.current = null

    ;(async () => {
      try {
        const paypal = await loadPayPalSdk(clientId)
        if (cancelled || !container) return
        const buttons = paypal.Buttons({
          style: { layout: 'vertical', shape: 'rect', label: 'paypal', height: 42 },
          createOrder: async () => {
            const result = await api.createPayPalOrder({ packageId: selectedPackage.id })
            return result.orderId
          },
          onApprove: async (data) => {
            const result = await api.capturePayPalOrder({ orderId: data.orderID })
            dispatch(updateAiCredits(result.credits))
            setSuccess({ addedCredits: result.addedCredits || selectedPackage.credits, total: result.credits })
          },
          onCancel: () => setSdkError('Payment was cancelled. No credits were added.'),
          onError: (error) => setSdkError(error?.message || 'PayPal checkout failed. No credits were added.'),
        })
        paypalButtonsRef.current = buttons
        await buttons.render(container)
      } catch (error) {
        if (!cancelled) setSdkError(error.message)
      }
    })()

    return () => {
      cancelled = true
      container.innerHTML = ''
      paypalButtonsRef.current = null
    }
  }, [clientId, selectedPackage?.id, success, dispatch])

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#14171d] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-100"><CreditCard size={16} className="text-violet-400" /> Add AI Credits</div>
            <div className="mt-1 text-[11px] text-slate-500">Current balance: {currentCredits} credits</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-slate-200"><X size={16} /></button>
        </div>

        <div className="p-5">
          {loadingPackages ? (
            <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-500"><Loader2 size={15} className="animate-spin" /> Loading credit packages…</div>
          ) : success ? (
            <div className="py-8 text-center">
              <CheckCircle2 size={38} className="mx-auto text-emerald-400" />
              <div className="mt-3 text-sm font-semibold text-slate-100">Credits added successfully</div>
              <div className="mt-1 text-xs text-slate-500">+{success.addedCredits} credits · New balance: {success.total}</div>
              <button type="button" onClick={onClose} className="mt-5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500">Done</button>
            </div>
          ) : (
            <>
              <div className="mb-3 text-xs font-semibold text-slate-300">Choose a credit package</div>
              <div className="grid grid-cols-3 gap-2">
                {packages.map((item) => (
                  <button key={item.id} type="button" onClick={() => { setSelectedId(item.id); setSdkError('') }} className={`rounded-xl border p-3 text-left transition ${selectedId === item.id ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-[#0d0f13] hover:border-white/20'}`}>
                    <div className="text-sm font-bold text-slate-100">{item.credits}</div>
                    <div className="text-[10px] text-slate-500">AI credits</div>
                    <div className="mt-3 text-sm font-semibold text-slate-200">${item.price}</div>
                    <div className="mt-1 text-[9px] text-slate-600">one-time purchase</div>
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-[#0d0f13] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div><div className="text-[10px] uppercase tracking-wide text-slate-600">Selected</div><div className="text-xs font-semibold text-slate-200">{selectedPackage?.credits} AI credits</div></div>
                  <div className="text-sm font-bold text-slate-100">${selectedPackage?.price}</div>
                </div>
                <div ref={buttonContainerRef} className="min-h-[44px]" />
              </div>

              {sdkError && <div className="mt-3 rounded-lg bg-red-500/10 p-3 text-[10px] leading-4 text-red-300">{sdkError}</div>}
              <div className="mt-3 text-center text-[9px] leading-4 text-slate-600">Payments are processed by PayPal. Your AI credits are added only after the server verifies a completed PayPal capture.</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
