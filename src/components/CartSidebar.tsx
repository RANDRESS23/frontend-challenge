import React from 'react'
import { useCart } from '../context/CartContext'
import './CartSidebar.css'
import { Product } from '../types/Product'

interface CartSidebarProps {
  open: boolean
  onClose: () => void
}

const CartSidebar: React.FC<CartSidebarProps> = ({ open, onClose }) => {
  const { items, removeFromCart, updateQuantity } = useCart()
  const total = items.reduce((sum, i) => sum + i.product.basePrice * i.quantity, 0)

  // Format price display
  const formatPrice = (price: number) => {
      return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Calculate best pricing for quantity
  const calculatePrice = (product: Product, qty: number) => {
    if (!product.priceBreaks || product.priceBreaks.length === 0) {
      return product.basePrice * qty
    }

    // Sort from highest to lowest minQty
    const sortedBreaks = [...product.priceBreaks].sort((a, b) => b.minQty - a.minQty)

    // Find the best applicable break price
    const applicable = sortedBreaks.find(pb => qty >= pb.minQty) || { price: product.basePrice }

    return applicable.price * qty
  }

  // Calculate discount amount
  const getDiscount = (product: Product, qty: number) => {
    if (!product.priceBreaks || product.priceBreaks.length === 0) {
      return 0
    }

    const baseTotal = product.basePrice * qty
    const discountedTotal = calculatePrice(product, qty)
    
    // Calculate savings percentage
    return ((baseTotal - discountedTotal) / baseTotal) * 100
  }

  return (
    <div className={`cart-sidebar${open ? ' open' : ''}`}>
      <div className="cart-sidebar-backdrop" onClick={onClose} />
      <aside className="cart-sidebar-panel">
        <header className="cart-sidebar-header">
          <h2>Carrito de compras</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>
        <div className="cart-sidebar-content">
          {items.length === 0 ? (
            <div className="cart-empty">Tu carrito está vacío</div>
          ) : (
            <ul className="cart-items-list">
              {items.map((item, index) => (
                <div key={item.product.id}>
                  <li className="cart-item">
                    <div className="main-image">
                      <div className="image-placeholder">
                        <span className="material-icons">image</span>
                      </div>
                    </div>
                    <div className="cart-item-info">
                      <div className="cart-item-title">
                        {item.product.name}

                        {getDiscount(item.product, item.quantity) > 0 && (
                          <div className="summary-row discount-row">
                            <span className="summary-value discount-value">
                              {`(-${getDiscount(item.product, item.quantity).toFixed(1)}%)`}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="cart-item-price">{formatPrice(calculatePrice(item.product, item.quantity) / item.quantity)}</div>
                      <div className="quantity-selector">
                        <div className="quantity-controls">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="quantity-btn"
                          >
                            <span className="material-icons">remove</span>
                          </button>
                          <input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => {
                              const val = parseInt(e.target.value)
                              const newQty = Math.min(item.product.stock, Math.max(1, val) || 1)
                              updateQuantity(item.product.id, newQty)
                            }}
                            className="quantity-input"
                            min="1"
                            max={item.product.stock}
                          />
                          <button 
                            onClick={() => {
                              if (item.quantity === item.product.stock) return
                              updateQuantity(item.product.id, item.quantity + 1)}
                            }
                            className="quantity-btn"
                          >
                            <span className="material-icons">add</span>
                          </button>
                        </div>
                      </div>

                    </div>
                    <button className="cart-item-remove" onClick={() => removeFromCart(item.product.id)}>&times;</button>
                  </li>
                
                  { 
                    items.length - 1 !== index && (
                      <div className="cart-item-divider" />
                    )
                  }
                </div>
              ))}
            </ul>
          )}
        </div>
        <footer className="cart-sidebar-footer">
          <div className="cart-sidebar-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <button 
            className="cart-sidebar-checkout"
            onClick={() => window.dispatchEvent(new CustomEvent('open-quote-simulator'))}  
          >
            <span className="material-icons">calculate</span>
            Solicitar cotización
          </button>
        </footer>
      </aside>
    </div>
  )
}

export default CartSidebar
