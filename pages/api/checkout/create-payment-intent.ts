import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe, validateCart, generateOrderNumber, type CartItem } from '../../../lib/stripe'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed')
  try {
    const { items, email, name, shipping, discount_code, discount_amount } = req.body as {
      items: CartItem[]; email: string; name: string
      discount_code?: string; discount_amount?: number
      shipping: { name: string; line1: string; line2?: string; city: string; state: string; zip: string; country: string }
    }

    const { total, items: validatedItems } = validateCart(items)
    const discountCents = discount_amount || 0
    const finalTotal    = total - discountCents

    const itemDescription = validatedItems
      .map(i => `${i.name} x${i.quantity} — $${((i.price_cents * i.quantity) / 100).toFixed(2)}`)
      .join(' | ')

    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalTotal,
      currency: 'usd',
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
      description: itemDescription,
      shipping: {
        name: shipping.name,
        address: { line1: shipping.line1, line2: shipping.line2 || undefined, city: shipping.city, state: shipping.state, postal_code: shipping.zip, country: shipping.country || 'US' },
      },
      metadata: {
        guest_email: email,
        customer_name: name,
        items: itemDescription,
        discount_code: discount_code || '',
        discount_amount_cents: discountCents.toString(),
        order_items: JSON.stringify(validatedItems.map(i => ({ id: i.id, qty: i.quantity }))),
      },
    })

    res.status(200).json({ clientSecret: paymentIntent.client_secret, orderNumber: generateOrderNumber() })
  } catch (err: any) {
    console.error('create-payment-intent error:', err)
    res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
