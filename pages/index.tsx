import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  CUSTOMIZE YOUR STORE — edit everything in this section
// ─────────────────────────────────────────────────────────────────────────────

const BUSINESS_NAME     = "Flour & Co."
const BUSINESS_TAGLINE  = "Baked fresh daily, with love"
const BUSINESS_LOCATION = "Austin, Texas"
const BUSINESS_SOCIAL   = "@flourandco"
const BUSINESS_SOCIAL_URL = "https://instagram.com/flourandco"
const COLLECTION_NAME   = "Today's Menu"
const COLLECTION_YEAR   = "2026"
const ACCENT_COLOR      = "#8B4513"   // your brand color — find hex codes at coolors.co
const ACCENT_LIGHT      = "#FAF0E6"   // a lighter tint of your brand color
const SHIPPING          = 6.99        // flat rate shipping fee in dollars

// Your products — add as many as you like
// For each product:
//   id:          a unique number (1, 2, 3...)
//   name:        the product name shown on the site
//   description: a short appealing description
//   price:       price in dollars (e.g. 12.00)
//   image:       filename of the photo you uploaded to the public/ folder
//                (e.g. '/croissant.png') — see README for photo upload instructions
const PRODUCTS = [
  {
    id: 1,
    name: 'Sourdough Loaf',
    description: 'Classic tangy sourdough with a crispy crust and chewy crumb. Baked fresh every morning.',
    price: 12.00,
    image: '/product-1.png',
  },
  {
    id: 2,
    name: 'Croissants (6-pack)',
    description: 'Buttery, flaky croissants made with 72-hour laminated dough. Perfect with jam or on their own.',
    price: 18.00,
    image: '/product-2.png',
  },
  {
    id: 3,
    name: 'Cinnamon Roll',
    description: 'Soft, pillowy cinnamon roll topped with rich cream cheese icing. A weekend favourite.',
    price: 8.00,
    image: '/product-3.png',
  },
  {
    id: 4,
    name: 'Chocolate Babka',
    description: 'Swirled chocolate babka with a glossy glaze. Rich, tender, and impossible to resist.',
    price: 22.00,
    image: '/product-4.png',
  },
]

// Discount codes — add your own or remove this section
// Format: 'CODE': discount_as_decimal (0.10 = 10%, 0.20 = 20%)
const DISCOUNT_CODES: Record<string, number> = {
  'WELCOME10': 0.10,
  'SUMMER20':  0.20,
}

// ─────────────────────────────────────────────────────────────────────────────
// ⛔ Do not edit below this line unless you know what you're doing
// ─────────────────────────────────────────────────────────────────────────────

interface CartItem {
  id: number; name: string; description: string
  price: number; image: string; qty: number
}

export default function Home() {
  const router = useRouter()
  const [cart, setCart]               = useState<CartItem[]>([])
  const [cartOpen, setCartOpen]       = useState(false)
  const [step, setStep]               = useState<'cart' | 'checkout'>('cart')
  const [discountCode, setDiscountCode] = useState('')
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
  const [discountPct, setDiscountPct] = useState(0)
  const [discountError, setDiscountError] = useState<string | null>(null)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: ''
  })

  function addToCart(p: typeof PRODUCTS[0]) {
    setCart(prev => {
      const ex = prev.find(x => x.id === p.id)
      if (ex) return prev.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x)
      return [...prev, { ...p, qty: 1 }]
    })
    setCartOpen(true)
    setStep('cart')
  }

  function changeQty(id: number, delta: number) {
    setCart(prev => prev.map(x => x.id === id ? { ...x, qty: x.qty + delta } : x).filter(x => x.qty > 0))
  }

  function applyDiscount() {
    const code = discountCode.trim().toUpperCase()
    if (DISCOUNT_CODES[code]) {
      setAppliedCode(code)
      setDiscountPct(DISCOUNT_CODES[code])
      setDiscountError(null)
    } else {
      setDiscountError('Invalid discount code.')
      setAppliedCode(null)
      setDiscountPct(0)
    }
  }

  function removeDiscount() {
    setAppliedCode(null)
    setDiscountPct(0)
    setDiscountCode('')
    setDiscountError(null)
  }

  function goToPayment() {
    const data = {
      items: cart.map(i => ({ product_id: i.id, quantity: i.qty, name: i.name, price: i.price })),
      email: form.email || 'guest@example.com',
      name: `${form.firstName} ${form.lastName}`.trim() || 'Guest',
      total: Math.round(finalTotal * 100),
      subtotal: Math.round(subtotal * 100),
      discount_amount: Math.round(discountAmount * 100),
      discount_code: appliedCode,
      discount_pct: discountPct,
      shipping: {
        name: `${form.firstName} ${form.lastName}`.trim() || 'Guest',
        line1: form.address || '123 Main St',
        city: form.city || 'Austin',
        state: form.state || 'TX',
        zip: form.zip || '78701',
        country: 'US',
      }
    }
    sessionStorage.setItem('storefront_checkout', JSON.stringify(data))
    router.push('/checkout')
  }

  const subtotal       = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const discountAmount = subtotal * discountPct
  const finalTotal     = subtotal - discountAmount + SHIPPING
  const cartCount      = cart.reduce((s, i) => s + i.qty, 0)

  const inputStyle = {
    width: '100%', border: `0.5px solid #E0D5C5`, borderRadius: 8,
    padding: '8px 10px', fontSize: 13, background: '#fff', outline: 'none',
    fontFamily: 'inherit'
  }

  return (
    <>
      <Head>
        <title>{BUSINESS_NAME} — {COLLECTION_NAME}</title>
        <meta name="description" content={BUSINESS_TAGLINE} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FAF6F0; font-family: 'Jost', sans-serif; color: #1C1410; }
        button { font-family: 'Jost', sans-serif; cursor: pointer; }
        input, select { font-family: 'Jost', sans-serif; }
      `}</style>

      {/* NAV */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.2rem 2rem', borderBottom:'0.5px solid #E0D5C5', background:'#FAF6F0', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, fontWeight:500, letterSpacing:'0.08em' }}>
          {BUSINESS_NAME.split(' ').slice(0,-1).join(' ')}{' '}
          <span style={{ color: ACCENT_COLOR, fontStyle:'italic' }}>{BUSINESS_NAME.split(' ').slice(-1)}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
          <a href="/account" style={{ fontSize:13, color:'#6B5C4A', textDecoration:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>My Account</a>
          <button onClick={() => { setCartOpen(true); setStep('cart') }} style={{ position:'relative', background:'none', border:'none', fontSize:20 }}>
            🛍
            {cartCount > 0 && (
              <span style={{ position:'absolute', top:-6, right:-8, background: ACCENT_COLOR, color:'#fff', fontSize:10, fontWeight:500, borderRadius:'50%', width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ padding:'4rem 2rem 3rem', textAlign:'center', background:`linear-gradient(180deg,#FAF6F0 0%,${ACCENT_LIGHT} 100%)` }}>
        <div style={{ fontSize:11, letterSpacing:'0.25em', textTransform:'uppercase', color: ACCENT_COLOR, marginBottom:'1rem' }}>
          {COLLECTION_NAME} — {COLLECTION_YEAR}
        </div>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(36px,6vw,58px)', fontWeight:300, lineHeight:1.15, marginBottom:'1rem' }}>
          {BUSINESS_TAGLINE.split(',')[0]},<br />
          <em style={{ color: ACCENT_COLOR }}>{BUSINESS_TAGLINE.split(',').slice(1).join(',').trim()}</em>
        </h1>
        <p style={{ fontSize:14, fontWeight:300, color:'#6B5C4A', letterSpacing:'0.05em', maxWidth:360, margin:'0 auto' }}>
          Handcrafted with care, shipped right to your door.
        </p>
      </div>

      {/* PRODUCT GRID */}
      <div style={{ padding:'2.5rem 2rem', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ fontSize:12, letterSpacing:'0.15em', textTransform:'uppercase', color: ACCENT_COLOR, marginBottom:'0.4rem' }}>Shop the Collection</div>
        <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:30, fontWeight:400, marginBottom:'2rem' }}>{COLLECTION_NAME}</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1.25rem' }}>
          {PRODUCTS.map(p => (
            <div key={p.id} style={{ background:'#FDFAF6', border:'0.5px solid #E0D5C5', borderRadius:12, overflow:'hidden' }}>
              {/* Product image — upload photos to your public/ folder and update the image field above */}
              <div style={{ height:200, overflow:'hidden', borderRadius:'12px 12px 0 0', background: ACCENT_LIGHT, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <img
                  src={p.image}
                  alt={p.name}
                  style={{ width:'100%', height:'100%', objectFit:'cover' }}
                  onError={e => {
                    // Shows a placeholder if photo hasn't been uploaded yet
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.parentElement!.innerHTML = `<div style="text-align:center;padding:2rem;color:#9B8B78;font-family:sans-serif;font-size:13px;">📷<br/>Add photo<br/>${p.image}</div>`
                  }}
                />
              </div>
              <div style={{ padding:'1rem' }}>
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:18, fontWeight:500, marginBottom:4 }}>{p.name}</div>
                <div style={{ fontSize:11, color:'#6B5C4A', marginBottom:'0.75rem', lineHeight:1.5 }}>{p.description}</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ fontSize:15, fontWeight:500 }}>${p.price.toFixed(2)}</div>
                  <button
                    onClick={() => addToCart(p)}
                    style={{ fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', background:'#1C1410', color:'#FAF6F0', border:'none', padding:'6px 14px', borderRadius:6 }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop:'0.5px solid #E0D5C5', padding:'2rem', textAlign:'center', marginTop:'3rem' }}>
        <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:18, color: ACCENT_COLOR, marginBottom:8 }}>{BUSINESS_NAME}</div>
        <div style={{ fontSize:12, color:'#6B5C4A' }}>
          {BUSINESS_LOCATION} ·{' '}
          <a href={BUSINESS_SOCIAL_URL} target="_blank" style={{ color: ACCENT_COLOR, textDecoration:'none' }}>{BUSINESS_SOCIAL}</a>
        </div>
      </footer>

      {/* OVERLAY */}
      {cartOpen && <div onClick={() => setCartOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(28,20,16,0.4)', zIndex:100 }} />}

      {/* CART SIDEBAR */}
      <div style={{ position:'fixed', top:0, right:0, width:'min(440px,100%)', height:'100%', background:'#FAF6F0', zIndex:101, transform: cartOpen ? 'translateX(0)' : 'translateX(100%)', transition:'transform 0.3s ease', display:'flex', flexDirection:'column', overflowY:'auto' }}>
        <div style={{ padding:'1.5rem', borderBottom:'0.5px solid #E0D5C5', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22 }}>{step === 'cart' ? 'Your Cart' : 'Checkout'}</div>
          <button onClick={() => setCartOpen(false)} style={{ background:'none', border:'none', fontSize:20, color:'#6B5C4A' }}>✕</button>
        </div>

        {/* ── CART VIEW ── */}
        {step === 'cart' && (
          <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
            <div style={{ flex:1, padding:'1rem 1.5rem', overflowY:'auto' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign:'center', padding:'3rem 1rem', color:'#6B5C4A' }}>
                  <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:20, marginBottom:8 }}>Your cart is empty.</div>
                  <div style={{ fontSize:12 }}>Add something to get started.</div>
                </div>
              ) : cart.map(item => (
                <div key={item.id} style={{ display:'flex', gap:12, padding:'1rem 0', borderBottom:'0.5px solid #E0D5C5' }}>
                  <div style={{ width:44, height:44, borderRadius:8, overflow:'hidden', flexShrink:0, background: ACCENT_LIGHT }}>
                    <img src={item.image} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:16, fontWeight:500 }}>{item.name}</div>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:6, marginTop:2 }}>${item.price.toFixed(2)}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <button onClick={() => changeQty(item.id, -1)} style={{ background:'none', border:'0.5px solid #E0D5C5', width:24, height:24, borderRadius:4, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                      <span style={{ fontSize:13, minWidth:20, textAlign:'center' }}>{item.qty}</span>
                      <button onClick={() => changeQty(item.id, 1)} style={{ background:'none', border:'0.5px solid #E0D5C5', width:24, height:24, borderRadius:4, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                    </div>
                  </div>
                  <button onClick={() => changeQty(item.id, -item.qty)} style={{ background:'none', border:'none', color:'#6B5C4A', fontSize:16, alignSelf:'flex-start', padding:4 }}>✕</button>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div style={{ padding:'1rem 1.5rem', borderTop:'0.5px solid #E0D5C5' }}>
                {/* Discount code */}
                <div style={{ marginBottom:'1rem' }}>
                  <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'#6B5C4A', marginBottom:6 }}>Discount Code</div>
                  {appliedCode ? (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#E1F5EE', border:'0.5px solid #9FE1CB', borderRadius:8, padding:'8px 12px' }}>
                      <span style={{ fontSize:12, fontWeight:500, color:'#0F6E56' }}>{appliedCode} — {(discountPct*100).toFixed(0)}% off</span>
                      <button onClick={removeDiscount} style={{ background:'none', border:'none', color:'#0F6E56', fontSize:14 }}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display:'flex', gap:8 }}>
                      <input value={discountCode} onChange={e => { setDiscountCode(e.target.value); setDiscountError(null) }} onKeyDown={e => e.key === 'Enter' && applyDiscount()} placeholder="Enter code" style={{ ...inputStyle, flex:1, textTransform:'uppercase' }} />
                      <button onClick={applyDiscount} style={{ padding:'8px 14px', background:'#1C1410', color:'#FAF6F0', border:'none', borderRadius:8, fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase' }}>Apply</button>
                    </div>
                  )}
                  {discountError && <div style={{ fontSize:11, color:'#991B1B', marginTop:4 }}>{discountError}</div>}
                </div>

                {/* Summary */}
                <div style={{ background:'#F5EDE0', borderRadius:10, padding:'1rem', marginBottom:'1rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#6B5C4A', marginBottom:6 }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  {appliedCode && <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#0F6E56', marginBottom:6 }}><span>Discount ({appliedCode})</span><span>−${discountAmount.toFixed(2)}</span></div>}
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#6B5C4A', marginBottom:6 }}><span>Shipping (flat rate)</span><span>${SHIPPING.toFixed(2)}</span></div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:15, fontWeight:500, borderTop:'0.5px solid #E0D5C5', paddingTop:8, marginTop:4 }}><span>Total</span><span>${finalTotal.toFixed(2)}</span></div>
                </div>
                <button onClick={() => setStep('checkout')} style={{ width:'100%', padding:14, background:'#1C1410', color:'#FAF6F0', border:'none', borderRadius:10, fontSize:14, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── CHECKOUT VIEW ── */}
        {step === 'checkout' && (
          <div style={{ flex:1, overflowY:'auto', padding:'1rem 1.5rem' }}>
            <div style={{ fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color: ACCENT_COLOR, marginBottom:'0.75rem' }}>Contact Information</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
              {(['firstName','lastName'] as const).map(f => (
                <div key={f}>
                  <label style={{ fontSize:11, color:'#6B5C4A', display:'block', marginBottom:3 }}>{f === 'firstName' ? 'First name' : 'Last name'}</label>
                  <input value={form[f]} onChange={e => setForm(p=>({...p,[f]:e.target.value}))} placeholder={f === 'firstName' ? 'First' : 'Last'} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom:8 }}>
              <label style={{ fontSize:11, color:'#6B5C4A', display:'block', marginBottom:3 }}>Email address</label>
              <input type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} placeholder="you@email.com" style={inputStyle} />
            </div>
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ fontSize:11, color:'#6B5C4A', display:'block', marginBottom:3 }}>Phone (optional)</label>
              <input value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))} placeholder="(555) 000-0000" style={inputStyle} />
            </div>
            <hr style={{ border:'none', borderTop:'0.5px solid #E0D5C5', margin:'1rem 0' }} />
            <div style={{ fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color: ACCENT_COLOR, marginBottom:'0.75rem' }}>Shipping Address</div>
            <div style={{ marginBottom:8 }}>
              <label style={{ fontSize:11, color:'#6B5C4A', display:'block', marginBottom:3 }}>Street address</label>
              <input value={form.address} onChange={e => setForm(p=>({...p,address:e.target.value}))} placeholder="123 Main Street" style={inputStyle} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
              <div>
                <label style={{ fontSize:11, color:'#6B5C4A', display:'block', marginBottom:3 }}>City</label>
                <input value={form.city} onChange={e => setForm(p=>({...p,city:e.target.value}))} placeholder="City" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize:11, color:'#6B5C4A', display:'block', marginBottom:3 }}>State</label>
                <input value={form.state} onChange={e => setForm(p=>({...p,state:e.target.value}))} placeholder="TX" style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom:'1.5rem' }}>
              <label style={{ fontSize:11, color:'#6B5C4A', display:'block', marginBottom:3 }}>ZIP code</label>
              <input value={form.zip} onChange={e => setForm(p=>({...p,zip:e.target.value}))} placeholder="78701" style={inputStyle} />
            </div>
            <hr style={{ border:'none', borderTop:'0.5px solid #E0D5C5', margin:'1rem 0' }} />
            <div style={{ fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color: ACCENT_COLOR, marginBottom:'0.75rem' }}>Order Summary</div>
            {cart.map(item => (
              <div key={item.id} style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#6B5C4A', marginBottom:4 }}>
                <span>{item.name} × {item.qty}</span><span>${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ background:'#F5EDE0', borderRadius:10, padding:'1rem', marginTop:'0.75rem', marginBottom:'1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#6B5C4A', marginBottom:6 }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {appliedCode && <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#0F6E56', marginBottom:6 }}><span>Discount ({appliedCode})</span><span>−${discountAmount.toFixed(2)}</span></div>}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#6B5C4A', marginBottom:6 }}><span>Shipping</span><span>${SHIPPING.toFixed(2)}</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:15, fontWeight:500, borderTop:'0.5px solid #E0D5C5', paddingTop:8, marginTop:4 }}><span>Total</span><span>${finalTotal.toFixed(2)}</span></div>
            </div>
            <button onClick={goToPayment} style={{ width:'100%', padding:14, background:'#1C1410', color:'#FAF6F0', border:'none', borderRadius:10, fontSize:14, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>
              Continue to Payment →
            </button>
            <button onClick={() => setStep('cart')} style={{ width:'100%', padding:11, background:'transparent', color:'#1C1410', border:'0.5px solid #E0D5C5', borderRadius:10, fontSize:13 }}>
              ← Back to Cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}
