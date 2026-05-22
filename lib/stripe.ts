import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  Keep this in sync with the PRODUCTS array in pages/index.tsx
//     Prices here are in CENTS (multiply dollars × 100)
//     e.g. $12.00 = 1200
// ─────────────────────────────────────────────────────────────────────────────
export const PRODUCTS = [
  { id: 1, name: 'Sourdough Loaf',     price_cents: 1200 },
  { id: 2, name: 'Croissants (6-pack)', price_cents: 1800 },
  { id: 3, name: 'Cinnamon Roll',       price_cents:  800 },
  { id: 4, name: 'Chocolate Babka',     price_cents: 2200 },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  Update this to match the SHIPPING value in pages/index.tsx (in cents)
// ─────────────────────────────────────────────────────────────────────────────
export const SHIPPING_CENTS = 699  // $6.99

export interface CartItem {
  product_id: number
  quantity: number
}

export function generateOrderNumber(): string {
  const yy   = new Date().getFullYear().toString().slice(-2)
  const mm   = String(new Date().getMonth() + 1).padStart(2, '0')
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  return `ORD-${yy}${mm}-${rand}`
}

export function validateCart(items: CartItem[]) {
  let subtotal = 0
  const validatedItems = []
  for (const item of items) {
    const product = PRODUCTS.find(p => p.id === item.product_id)
    if (!product) throw new Error(`Invalid product id: ${item.product_id}`)
    if (item.quantity < 1 || item.quantity > 20) throw new Error(`Invalid quantity for ${product.name}`)
    subtotal += product.price_cents * item.quantity
    validatedItems.push({ ...product, quantity: item.quantity })
  }
  return { subtotal, shipping: SHIPPING_CENTS, total: subtotal + SHIPPING_CENTS, items: validatedItems }
}
