import type { NextApiRequest, NextApiResponse } from 'next'
import { buffer } from 'micro'
import Stripe from 'stripe'
import { stripe } from '../../../lib/stripe'
import { supabaseAdmin } from '../../../lib/supabase-admin'

export const config = { api: { bodyParser: false } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed')

  const sig     = req.headers['stripe-signature']!
  const rawBody = await buffer(req)
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return res.status(400).json({ error: `Webhook error: ${err.message}` })
  }

  try {
    switch (event.type) {

      case 'payment_intent.succeeded': {
        const pi       = event.data.object as Stripe.PaymentIntent
        const email    = pi.receipt_email || pi.metadata?.guest_email
        const name     = pi.shipping?.name || pi.metadata?.customer_name || 'Guest'
        const shipping = pi.shipping?.address

        let items: { id: number; qty: number }[] = []
        try { items = JSON.parse(pi.metadata?.order_items || '[]') } catch {}

        const yy   = new Date().getFullYear().toString().slice(-2)
        const mm   = String(new Date().getMonth() + 1).padStart(2, '0')
        const rand = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
        const orderNumber = `ORD-${yy}${mm}-${rand}`

        let userId = null
        if (email) {
          const { data: users } = await supabaseAdmin.auth.admin.listUsers()
          const match = users?.users?.find(u => u.email === email)
          if (match) userId = match.id
        }

        const discountCents = parseInt(pi.metadata?.discount_amount_cents || '0')

        const { data: order, error: orderError } = await supabaseAdmin.from('orders').insert({
          order_number: orderNumber,
          user_id: userId,
          guest_email: userId ? null : email,
          guest_name:  userId ? null : name,
          stripe_payment_intent_id: pi.id,
          subtotal_cents: pi.amount + discountCents - 699, // shipping placeholder
          shipping_cents: 699,
          total_cents: pi.amount,
          status: 'paid',
          shipping_name: name,
          shipping_line1: shipping?.line1 || '',
          shipping_line2: shipping?.line2 || null,
          shipping_city:  shipping?.city || '',
          shipping_state: shipping?.state || '',
          shipping_zip:   shipping?.postal_code || '',
          shipping_country: shipping?.country || 'US',
        }).select().single()

        if (orderError) { console.error('Order insert error:', orderError); break }

        if (items.length > 0 && order) {
          const { PRODUCTS } = await import('../../../lib/stripe')
          await supabaseAdmin.from('order_items').insert(
            items.map(item => {
              const product = PRODUCTS.find(p => p.id === item.id)
              return {
                order_id: order.id,
                product_id: item.id,
                product_name: product?.name || 'Unknown',
                scent: '',
                quantity: item.qty,
                unit_price_cents: product?.price_cents || 0,
              }
            })
          )
        }

        console.log(`✅ Order ${orderNumber} saved`)
        break
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        console.log(`❌ Payment failed: ${pi.id}`)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await supabaseAdmin.from('orders').update({ status: 'refunded' }).eq('stripe_payment_intent_id', charge.payment_intent as string)
        break
      }
    }

    res.status(200).json({ received: true })
  } catch (err: any) {
    console.error('Webhook handler error:', err)
    res.status(500).json({ error: 'Webhook handler failed' })
  }
}
