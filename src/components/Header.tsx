import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Header.css'

interface HeaderProps {
  onCartClick?: () => void
}

const Header = ({ onCartClick }: HeaderProps) => {
  const { totalItems } = useCart()
  
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-icon">
              <span className="material-icons">store</span>
            </div>
            <span className="logo-text p1-medium">SWAG Challenge</span>
          </Link>

          {/* Navigation */}
          <nav className="nav">
            <Link to="/" className="nav-link l1 nav-home">
              <span className="material-icons">home</span>
              Catálogo
            </Link>
            <button className="nav-link l1" onClick={onCartClick}>
              <span className="material-icons">shopping_cart</span>
              <span className='nav-carrito-text'>Carrito</span>{totalItems > 0 ? ` (${totalItems})` : ''}
            </button>
          </nav>

          {/* Actions */}
          <div className="header-actions">
            <button className="btn btn-secondary cta1">
              <span className="material-icons">person</span>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header