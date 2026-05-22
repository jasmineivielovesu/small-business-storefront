import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Head from 'next/head'
import { useRouter } from 'next/router'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutForm({ orderNumber, total, onSuccess }: { orderNumber: string; total: number; onSuccess: () => void }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/confirmation?order=${orderNumber}` },
      redirect: 'if_required',
    })
    if (error) { setError(error.message || 'Payment failed. Please try again.'); setLoading(false) }
    else onSuccess()
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && (
        <div style={{ marginTop:12, padding:'10px 14px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, color:'#991B1B', fontSize:13 }}>
          {error}
        </div>
      )}
      <button type="submit" disabled={!stripe || loading} style={{ width:'100%', marginTop:20, padding:14, background: loading ? '#9B8B78' : '#1C1410', color:'#FAF6F0', border:'none', borderRadius:10, fontFamily:'inherit', fontSize:14, letterSpacing:'0.1em', textTransform:'uppercase', cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Processing...' : `Place Order · $${(total / 100).toFixed(2)}`}
      </button>
    </form>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderNumber,  setOrderNumber]  = useState<string | null>(null)
  const [total,        setTotal]        = useState(0)
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('storefront_checkout')
    if (!raw) { setError('No checkout data found. Please return to the store.'); return }
    const data = JSON.parse(raw)
    setTotal(data.total)
    fetch('/api/checkout/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(r => r.json())
      .then(json => {
        if (json.error) { setError(json.error); return }
        setClientSecret(json.clientSecret)
        setOrderNumber(json.orderNumber)
      })
      .catch(() => setError('Failed to initialize payment.'))
  }, [])

  function handleSuccess() {
    router.push(`/confirmation?order=${orderNumber}`)
  }

  if (error) return (
    <div style={{ minHeight:'100vh', background:'#FAF6F0', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', textAlign:'center' }}>
      <div><p style={{ color:'#991B1B', marginBottom:16 }}>{error}</p><a href="/" style={{ color:'#8B4513' }}>← Return to Store</a></div>
    </div>
  )

  if (!clientSecret) return (
    <div style={{ minHeight:'100vh', background:'#FAF6F0', display:'flex', alignItems:'center', justifyContent:'center', color:'#6B5C4A', fontFamily:'sans-serif' }}>
      Preparing your checkout...
    </div>
  )

  return (
    <>
      <Head>
        <title>Checkout</title>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight:'100vh', background:'#FAF6F0', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'2rem', fontFamily:'Jost, sans-serif' }}>
        <div style={{ width:'100%', maxWidth:480 }}>
          <div style={{ textAlign:'center', marginBottom:'2rem' }}>
            <a href="/" style={{ fontFamily:'Georgia, serif', fontSize:22, color:'#1C1410', textDecoration:'none' }}>← Back to Store</a>
            <h1 style={{ fontFamily:'Georgia, serif', fontSize:26, fontWeight:300, marginTop:16 }}>Complete Your Order</h1>
          </div>
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme:'stripe', variables:{ colorPrimary:'#8B4513', colorBackground:'#FDFAF6', colorText:'#1C1410', fontFamily:'Jost, sans-serif', borderRadius:'8px' } } }}>
            <CheckoutForm orderNumber={orderNumber!} total={total} onSuccess={handleSuccess} />
          </Elements>
          <p style={{ marginTop:16, textAlign:'center', fontSize:12, color:'#9B8B78' }}>🔒 Secured by Stripe</p>
        </div>
      </div>
    </>
  )
}
