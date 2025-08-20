import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
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
      let msg = ''
      if (idx !== -1) {
        const updated = [...prev]
        const addQty = quantity > (product.stock - updated[idx].quantity) 
          ? product.stock - updated[idx].quantity 
          : quantity
        updated[idx].quantity += addQty
        msg = addQty > 0
          ? `Se agregaron ${addQty} unidad(es) de "${product.name}" al carrito.`
          : `No se pueden agregar más unidades de "${product.name}" (stock máximo).`
        toast.success(msg)
        return updated
      }
      msg = `Se agregó "${product.name}" al carrito.`
      toast.success(msg)
      return [...prev, { product, quantity }]
    })
  }

  const removeFromCart = (productId: number) => {
    setItems(prev => {
      const prod = prev.find(i => i.product.id === productId)
      if (prod) toast.info(`Se quitó "${prod.product.name}" del carrito.`)
      return prev.filter(i => i.product.id !== productId)
    })
  }

  const updateQuantity = (productId: number, quantity: number) => { 
    if (quantity === 0) removeFromCart(productId)
    else setItems(prev => prev.map(i => {
      if (i.product.id === productId) {
        toast.success(`Cantidad actualizada: "${i.product.name}" ahora tiene ${quantity} unidad(es).`)
        return { ...i, quantity }
      }
      return i
    }))
  }

  const clearCart = () => {
    setItems([])
    toast.info('Carrito vaciado.')
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}
