import { createContext, useContext, useEffect, useState } from 'react'
import { Product } from '../types/Product'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}

const CART_KEY = 'cart_items'

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(CART_KEY)
    if (stored) setItems(JSON.parse(stored))
  }, [])

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id)

      if (idx !== -1) {
        const updated = [...prev]

        updated[idx].quantity += quantity > (product.stock - updated[idx].quantity) 
          ? product.stock - updated[idx].quantity 
          : quantity

        return updated
      }

      return [...prev, { product, quantity }]
    })
  }

  const removeFromCart = (productId: number) => {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => { 
    if (quantity === 0) removeFromCart(productId)
    else setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}
