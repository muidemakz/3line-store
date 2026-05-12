export interface Product {
  id: string
  name: string
  brand: string
  pointsCost: number
  image: string
  category: string
  inStock: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  date: string
  items: CartItem[]
  totalPoints: number
  status: 'delivered' | 'pending' | 'cancelled'
}

export interface Session {
  id: string
  label: string
  daysLeft: number
  points: number
}

export type Page = 'marketplace' | 'cart' | 'order-history' | 'suggestions' | 'profile'
