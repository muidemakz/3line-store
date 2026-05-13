import type { Product, Order, Session } from '../types'

export const SESSIONS: Session[] = [
  { id: 'q1-2025', label: 'Q1 Palliative', daysLeft: 4, points: 300 },
  { id: 'q2-2025', label: 'Q2 Palliative', daysLeft: 32, points: 243 },
]

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Nestle-Milo Hot Coco Sachet 30G',
    brand: 'Nestle',
    pointsCost: 5,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop',
    category: 'Beverages',
    inStock: true,
  },
  {
    id: '2',
    name: 'Hollandia-Milk Hollandia 50G',
    brand: 'Hollandia',
    pointsCost: 5,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
    category: 'Dairy',
    inStock: true,
  },
  {
    id: '3',
    name: 'Nescafé - 3 in 1 Sachet',
    brand: 'Nescafé',
    pointsCost: 5,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
    category: 'Beverages',
    inStock: true,
  },
  {
    id: '4',
    name: 'Mama spice - Simply Spaghetti 500 g',
    brand: 'Mama Spice',
    pointsCost: 15,
    image: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400&h=400&fit=crop',
    category: 'Groceries',
    inStock: true,
  },
  {
    id: '5',
    name: 'Kraft - Mac & Cheese Dinner Box',
    brand: 'Kraft',
    pointsCost: 10,
    image: '',
    category: 'Groceries',
    inStock: true,
  },
  {
    id: '6',
    name: 'Quaker Oats - Instant Oatmeal 30G',
    brand: 'Quaker',
    pointsCost: 10,
    image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=400&fit=crop',
    category: 'Breakfast',
    inStock: true,
  },
  {
    id: '7',
    name: 'Golden Morn - Maize Cereal 500g',
    brand: 'Golden Morn',
    pointsCost: 12,
    image: 'https://images.unsplash.com/photo-1548439740-6e7ed1d5a52f?w=400&h=400&fit=crop',
    category: 'Breakfast',
    inStock: true,
  },
  {
    id: '8',
    name: 'Indomie - Instant Noodles Chicken',
    brand: 'Indomie',
    pointsCost: 3,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop',
    category: 'Groceries',
    inStock: true,
  },
  {
    id: '9',
    name: 'Betty Crocker - Chocolate Chip Cookie Mix',
    brand: 'Betty Crocker',
    pointsCost: 30,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop',
    category: 'Baking',
    inStock: true,
  },
]

export const MOCK_ORDERS: Order[] = []
