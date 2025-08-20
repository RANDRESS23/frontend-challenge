import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import CartSidebar from './components/CartSidebar'
import { CartProvider } from './context/CartContext'
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [cartOpen, setCartOpen] = useState(false)

  // Listen for open-cart-sidebar event
  useEffect(() => {
    const handler = () => setCartOpen(true)
    window.addEventListener('open-cart-sidebar', handler)
    return () => window.removeEventListener('open-cart-sidebar', handler)
  }, [])
  
  return (
    <CartProvider>
      <div className="App">
        <Header onCartClick={() => setCartOpen(true)} />
        <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
        <main>
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        </main>
      </div>
    </CartProvider>
  )
}

export default App