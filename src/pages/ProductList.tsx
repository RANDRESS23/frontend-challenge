import { useState } from 'react'
import ProductCard from '../components/ProductCard'
import ProductFilters from '../components/ProductFilters'
import { products as allProducts, categories } from '../data/products'
import { Product } from '../types/Product'
import './ProductList.css'

const ProductList = () => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(allProducts)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [selectedSupplier, setSelectedSupplier] = useState('all')
  // Price range: get min/max from all products
  const allPrices = allProducts.map(p => p.basePrice)
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice])

  // Function to remove accents from strings
  const removeAccents = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  // Filter and sort products based on criteria
  const filterProducts = (
    category: string,
    search: string,
    sort: string,
    supplier: string,
    price: [number, number]
  ) => {
    let filtered = [...allProducts]

    // Category filter
    if (category !== 'all') {
      filtered = filtered.filter(product => product.category === category)
    }
    
    // Supplier filter
    if (supplier !== 'all') {
      filtered = filtered.filter(product => product.supplier === supplier)
    }

    // Price range filter
    filtered = filtered.filter(product => product.basePrice >= price[0] && product.basePrice <= price[1])

    // Search filter
    if (search) {
      const searchLower = removeAccents(search.toLowerCase())
      filtered = filtered.filter(product => 
        removeAccents(product.name.toLowerCase()).includes(searchLower) ||
        removeAccents(product.sku.toLowerCase()).includes(searchLower)
      )
    }

    // Sorting logic
    switch (sort) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'price':
        filtered.sort((a, b) => a.basePrice - b.basePrice)
        break
      case 'stock':
        filtered.sort((a, b) => b.stock - a.stock)
        break
      default:
        break
    }

    setFilteredProducts(filtered)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    filterProducts(category, searchQuery, sortBy, selectedSupplier, priceRange)
  }

  const handleSupplierChange = (supplier: string) => {
    setSelectedSupplier(supplier)
    filterProducts(selectedCategory, searchQuery, sortBy, supplier, priceRange)
  }

  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range)
    filterProducts(selectedCategory, searchQuery, sortBy, selectedSupplier, range)
  }

  const handleSearchChange = (search: string) => {
    setSearchQuery(search)
    filterProducts(selectedCategory, search, sortBy, selectedSupplier, priceRange)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    filterProducts(selectedCategory, searchQuery, sort, selectedSupplier, priceRange)
  }

  const handleClearFilters = () => {
    setSelectedCategory('all')
    setSelectedSupplier('all')
    setPriceRange([minPrice, maxPrice])
    setSearchQuery('')
    setSortBy('name')
    filterProducts('all', '', 'name', 'all', [minPrice, maxPrice])
  }

  return (
    <div className="product-list-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-info">
            <h1 className="page-title h2">Catálogo de Productos</h1>
            <p className="page-subtitle p1">
              Descubre nuestra selección de productos promocionales premium
            </p>
          </div>
          
          <div className="page-stats">
            <div className="stat-item">
              <span className="stat-value p1-medium">{filteredProducts.length}</span>
              <span className="stat-label l1">productos</span>
            </div>
            <div className="stat-item">
              <span className="stat-value p1-medium">{categories.length - 1}</span>
              <span className="stat-label l1">categorías</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ProductFilters
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          sortBy={sortBy}
          selectedSupplier={selectedSupplier}
          priceRange={priceRange}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          onSupplierChange={handleSupplierChange}
          onPriceRangeChange={handlePriceRangeChange}
          onClearFilters={handleClearFilters}
        />

        {/* Products Grid */}
        <div className="products-section">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <span className="material-icons">search_off</span>
              <h3 className="h2">No hay productos</h3>
              <p className="p1">No se encontraron productos que coincidan con tu búsqueda.</p>
              <button 
                className="btn btn-primary cta1"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setSelectedSupplier('all')
                  setPriceRange([minPrice, maxPrice])
                  filterProducts('all', '', sortBy, 'all', [minPrice, maxPrice])
                }}
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductList