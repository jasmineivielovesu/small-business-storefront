import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

interface OrderData {
  items: { name: string; price: number; quantity: number }[]
  email: string; name: string; total: number; subtotal: number
  discount_amount: number; discount_code: string | null; shipping: { name: string; line1: string; city: string; state: string; zip: string }
}

const SHIPPING = 6.99 // keep in sync with index.tsx

export default function Confirmation() {
  const router    = useRouter()
  const { order } = router.query
  const [data,    setData]    = useState<OrderData | null>(null)
  const [orderDate] = useState(new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }))

  useEffect(() => {
    const raw = sessionStorage.getItem('storefront_checkout')
    if (raw) { setData(JSON.parse(raw)); sessionStorage.removeItem('storefront_checkout') }
  }, [])

  return (
    <>
      <Head>
        <title>Order Confirmed</title>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
        <style>{`@media print { .no-print { display: none !important; } body { background: #fff !important; } }`}</style>
      </Head>
      <style>{`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { background: #FAF6F0; font-family: 'Jost', sans-serif; color: #1C1410; } button { font-family: 'Jost', sans-serif; cursor: pointer; }`}</style>

      <nav className="no-print" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.2rem 2rem', borderBottom:'0.5px solid #E0D5C5', background:'#FAF6F0' }}>
        <a href="/" style={{ fontFamily:'Cormorant Garamond,serif', fontSize:20, fontWeight:500, textDecoration:'none', color:'#1C1410' }}>← Back to Store</a>
        <a href="/account" style={{ fontSize:13, color:'#6B5C4A', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>My Account</a>
      </nav>

      <div style={{ maxWidth:600, margin:'0 auto', padding:'3rem 2rem' }}>
        <div className="no-print" style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ width:60, height:60, borderRadius:'50%', background:'#E1F5EE', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', fontSize:28 }}>✓</div>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:36, fontWeight:300, marginBottom:8 }}>Thank you for your order.</h1>
          <p style={{ fontSize:13, color:'#6B5C4A' }}>A receipt has been sent to your email.</p>
        </div>

        {/* RECEIPT */}
        <div style={{ background:'#fff', border:'0.5px solid #E0D5C5', borderRadius:16, overflow:'hidden', marginBottom:'1.5rem' }}>
          <div style={{ background:'#1C1410', padding:'2rem', textAlign:'center' }}>
            <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:24, color:'#D4AF70', letterSpacing:'0.1em', marginBottom:4 }}>Order Confirmation</div>
            <div style={{ fontSize:11, color:'#9B8B78', letterSpacing:'0.2em', textTransform:'uppercase' }}>{order || '—'}</div>
          </div>
          <div style={{ padding:'2rem' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem', paddingBottom:'1.5rem', borderBottom:'0.5px solid #E0D5C5' }}>
              <div>
                <div style={{ fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'#8B4513', marginBottom:4 }}>Order Date</div>
                <div style={{ fontSize:14 }}>{orderDate}</div>
              </div>
              {data && (
                <>
                  <div>
                    <div style={{ fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'#8B4513', marginBottom:4 }}>Customer</div>
                    <div style={{ fontSize:14 }}>{data.name}</div>
                    <div style={{ fontSize:12, color:'#6B5C4A' }}>{data.email}</div>
                  </div>
                  <div style={{ gridColumn:'1 / -1' }}>
                    <div style={{ fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'#8B4513', marginBottom:4 }}>Ship To</div>
                    <div style={{ fontSize:13, lineHeight:1.6 }}>{data.shipping.name}<br />{data.shipping.line1}<br />{data.shipping.city}, {data.shipping.state} {data.shipping.zip}</div>
                  </div>
                </>
              )}
            </div>

            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'#8B4513', marginBottom:'1rem' }}>Items Ordered</div>
              {data?.items.map((item, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', paddingBottom:'0.75rem', marginBottom:'0.75rem', borderBottom:'0.5px solid #E0D5C5' }}>
                  <div>
                    <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:17, fontWeight:500 }}>{item.name}</div>
                    <div style={{ fontSize:12, color:'#9B8B78' }}>Qty: {item.quantity} × ${item.price.toFixed(2)}</div>
                  </div>
                  <div style={{ fontSize:15, fontWeight:500 }}>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div style={{ background:'#FAF6F0', borderRadius:10, padding:'1rem' }}>
              {data && <>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#6B5C4A', marginBottom:6 }}><span>Subtotal</span><span>${(data.subtotal / 100).toFixed(2)}</span></div>
                {data.discount_code && <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#0F6E56', marginBottom:6 }}><span>Discount ({data.discount_code})</span><span>−${(data.discount_amount / 100).toFixed(2)}</span></div>}
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#6B5C4A', marginBottom:6 }}><span>Shipping</span><span>${SHIPPING.toFixed(2)}</span></div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:17, fontWeight:500, borderTop:'0.5px solid #E0D5C5', paddingTop:10, marginTop:6 }}><span>Total</span><span>${(data.total / 100).toFixed(2)}</span></div>
              </>}
            </div>
          </div>
        </div>

        <div className="no-print" style={{ display:'flex', gap:12, marginBottom:'1rem' }}>
          <button onClick={() => window.print()} style={{ flex:1, padding:13, background:'#1C1410', color:'#FAF6F0', border:'none', borderRadius:10, fontSize:13, letterSpacing:'0.1em', textTransform:'uppercase' }}>
            Download / Print
          </button>
          <button onClick={() => router.push('/account')} style={{ flex:1, padding:13, background:'transparent', color:'#1C1410', border:'0.5px solid #E0D5C5', borderRadius:10, fontSize:13, letterSpacing:'0.1em', textTransform:'uppercase' }}>
            Track My Order
          </button>
        </div>
        <div className="no-print" style={{ textAlign:'center' }}>
          <a href="/" style={{ fontSize:13, color:'#8B4513' }}>← Continue Shopping</a>
        </div>
      </div>
    </>
  )
}
