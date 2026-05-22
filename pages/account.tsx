import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import type { Order } from '../lib/supabase'

export default function Account() {
  const [user,     setUser]     = useState<any>(null)
  const [orders,   setOrders]   = useState<Order[]>([])
  const [loading,  setLoading]  = useState(true)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [form,     setForm]     = useState({ firstName:'', lastName:'', email:'', password:'' })
  const [error,    setError]    = useState<string | null>(null)
  const [message,  setMessage]  = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      if (session?.user) fetchOrders(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) fetchOrders(session.user.id)
      else { setOrders([]); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchOrders(userId: string) {
    setLoading(true)
    const { data } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', userId).order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  async function handleLogin() {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (error) setError(error.message)
  }

  async function handleRegister() {
    setError(null)
    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: `${form.firstName} ${form.lastName}`.trim() } }
    })
    if (error) setError(error.message)
    else setMessage('Check your email to confirm your account!')
  }

  const STATUS_STEPS = ['paid', 'processing', 'shipped', 'delivered']

  return (
    <>
      <Head>
        <title>My Account</title>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <style>{`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { background: #FAF6F0; font-family: 'Jost', sans-serif; color: #1C1410; } button { font-family: 'Jost', sans-serif; cursor: pointer; } input { font-family: 'Jost', sans-serif; }`}</style>

      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.2rem 2rem', borderBottom:'0.5px solid #E0D5C5', background:'#FAF6F0' }}>
        <a href="/" style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, fontWeight:500, letterSpacing:'0.08em', textDecoration:'none', color:'#1C1410' }}>← Back to Store</a>
        {user && <button onClick={() => supabase.auth.signOut()} style={{ fontSize:13, color:'#6B5C4A', background:'none', border:'none', letterSpacing:'0.1em', textTransform:'uppercase' }}>Sign Out</button>}
      </nav>

      <div style={{ maxWidth:640, margin:'0 auto', padding:'3rem 2rem' }}>
        {!user && (
          <div style={{ maxWidth:400, margin:'0 auto', textAlign:'center' }}>
            <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:32, fontWeight:300, marginBottom:8 }}>
              {authMode === 'login' ? 'Welcome back.' : 'Create your account.'}
            </h1>
            <p style={{ fontSize:13, color:'#6B5C4A', marginBottom:'2rem' }}>
              {authMode === 'login' ? 'Sign in to view your orders.' : 'Save your info for faster checkout and order tracking.'}
            </p>
            {message && <div style={{ background:'#E1F5EE', border:'0.5px solid #9FE1CB', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#0F6E56', marginBottom:'1rem' }}>{message}</div>}
            {error   && <div style={{ background:'#FEF2F2', border:'0.5px solid #FECACA', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#991B1B', marginBottom:'1rem' }}>{error}</div>}
            <div style={{ textAlign:'left' }}>
              {authMode === 'register' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
                  {(['firstName','lastName'] as const).map(f => (
                    <div key={f}>
                      <label style={{ fontSize:11, color:'#6B5C4A', display:'block', marginBottom:3 }}>{f === 'firstName' ? 'First name' : 'Last name'}</label>
                      <input value={form[f]} onChange={e => setForm(p=>({...p,[f]:e.target.value}))} placeholder={f === 'firstName' ? 'First' : 'Last'} style={{ width:'100%', border:'0.5px solid #E0D5C5', borderRadius:8, padding:'8px 10px', fontSize:13, background:'#fff', outline:'none' }} />
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginBottom:8 }}>
                <label style={{ fontSize:11, color:'#6B5C4A', display:'block', marginBottom:3 }}>Email address</label>
                <input type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} placeholder="you@email.com" style={{ width:'100%', border:'0.5px solid #E0D5C5', borderRadius:8, padding:'8px 10px', fontSize:13, background:'#fff', outline:'none' }} />
              </div>
              <div style={{ marginBottom:'1rem' }}>
                <label style={{ fontSize:11, color:'#6B5C4A', display:'block', marginBottom:3 }}>Password</label>
                <input type="password" value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} placeholder="••••••••" style={{ width:'100%', border:'0.5px solid #E0D5C5', borderRadius:8, padding:'8px 10px', fontSize:13, background:'#fff', outline:'none' }} />
              </div>
              <button onClick={authMode === 'login' ? handleLogin : handleRegister} style={{ width:'100%', padding:12, background:'#8B4513', color:'#fff', border:'none', borderRadius:10, fontSize:13, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
              <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setError(null); setMessage(null) }} style={{ width:'100%', padding:11, background:'transparent', color:'#1C1410', border:'0.5px solid #E0D5C5', borderRadius:10, fontSize:13 }}>
                {authMode === 'login' ? 'Create an account' : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        )}

        {user && (
          <div>
            <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:32, fontWeight:300, marginBottom:4 }}>Welcome back.</h1>
            <p style={{ fontSize:13, color:'#6B5C4A', marginBottom:'2rem' }}>{user.email}</p>
            <div style={{ fontSize:12, letterSpacing:'0.15em', textTransform:'uppercase', color:'#8B4513', marginBottom:'1rem' }}>Order History</div>
            {loading ? (
              <p style={{ color:'#6B5C4A', fontSize:13 }}>Loading your orders...</p>
            ) : orders.length === 0 ? (
              <div style={{ background:'#FDFAF6', border:'0.5px solid #E0D5C5', borderRadius:12, padding:'2rem', textAlign:'center' }}>
                <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:20, marginBottom:8 }}>No orders yet.</p>
                <a href="/" style={{ fontSize:13, color:'#8B4513' }}>Start shopping →</a>
              </div>
            ) : orders.map(order => {
              const stepIndex = STATUS_STEPS.indexOf(order.status)
              return (
                <div key={order.id} style={{ background:'#FDFAF6', border:'0.5px solid #E0D5C5', borderRadius:12, padding:'1.25rem', marginBottom:'1rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' }}>
                    <div>
                      <div style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'#8B4513', marginBottom:4 }}>{order.order_number}</div>
                      <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:17, fontWeight:500 }}>{order.order_items?.map(i => i.product_name).join(', ')}</div>
                    </div>
                    <div style={{ fontSize:13, fontWeight:500 }}>${(order.total_cents / 100).toFixed(2)}</div>
                  </div>
                  <div style={{ fontSize:12, color:'#6B5C4A', marginBottom:'1rem' }}>{new Date(order.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</div>
                  <div style={{ display:'flex', alignItems:'flex-start' }}>
                    {STATUS_STEPS.map((s, i) => (
                      <div key={s} style={{ flex:1, textAlign:'center', position:'relative' }}>
                        {i < STATUS_STEPS.length - 1 && <div style={{ position:'absolute', top:9, left:'50%', width:'100%', height:1.5, background: i < stepIndex ? '#8B4513' : '#E0D5C5', zIndex:0 }} />}
                        <div style={{ width:20, height:20, borderRadius:'50%', border: i <= stepIndex ? '2px solid #8B4513' : '1.5px solid #E0D5C5', background: i < stepIndex ? '#8B4513' : '#fff', margin:'0 auto 6px', position:'relative', zIndex:1 }} />
                        <div style={{ fontSize:10, color: i <= stepIndex ? '#8B4513' : '#6B5C4A', textTransform:'capitalize' }}>{s}</div>
                      </div>
                    ))}
                  </div>
                  {order.tracking_number && (
                    <div style={{ marginTop:'1rem', fontSize:12, color:'#6B5C4A' }}>Tracking: <strong>{order.tracking_number}</strong> ({order.tracking_carrier})</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
