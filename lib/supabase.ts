import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnon)

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  guest_email: string | null
  guest_name: string | null
  subtotal_cents: number
  shipping_cents: number
  total_cents: number
  status: OrderStatus
  shipping_name: string
  shipping_line1: string
  shipping_line2: string | null
  shipping_city: string
  shipping_state: string
  shipping_zip: string
  shipping_country: string
  tracking_number: string | null
  tracking_carrier: string | null
  shipped_at: string | null
  delivered_at: string | null
  created_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: number
  product_name: string
  scent: string
  quantity: number
  unit_price_cents: number
}
