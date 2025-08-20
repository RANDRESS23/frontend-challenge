import { categories, suppliers } from '../data/products'
import './ProductFilters.css'

interface ProductFiltersProps {
  selectedCategory: string
  searchQuery: string
  sortBy: string
  selectedSupplier: string
  priceRange: [number, number]
  minPrice: number
  maxPrice: number
  onCategoryChange: (category: string) => void
  onSearchChange: (search: string) => void
  onSortChange: (sort: string) => void
  onSupplierChange: (supplier: string) => void
  onPriceRangeChange: (range: [number, number]) => void
  onClearFilters: () => void
}

const ProductFilters = ({
  selectedCategory,
  searchQuery,
  sortBy,
  selectedSupplier,
  priceRange,
  minPrice,
  maxPrice,
  onCategoryChange,
  onSearchChange,
  onSortChange,
  onSupplierChange,
  onPriceRangeChange,
  onClearFilters
}: ProductFiltersProps) => {
  return (
    <div className="product-filters">
      <div className="filters-card">
        {/* Search Bar */}
        <div className="search-section">
          <div className="search-box">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="Buscar productos, SKU..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input p1"
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => onSearchChange('')}
              >
                <span className="material-icons">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="filter-section">
          <h3 className="filter-title p1-medium">Categorías</h3>
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => onCategoryChange(category.id)}
              >
                <span className="material-icons">{category.icon}</span>
                <span className="category-name l1">{category.name}</span>
                <span className="category-count l1">({category.count})</span>
              </button>
            ))}
          </div>
        </div>


        {/* Supplier Filter */}
        <div className="filter-section">
          <h3 className="filter-title p1-medium">Proveedores</h3>
          <div className="category-filters">
            {suppliers.map(supplier => (
              <button
                key={supplier.id}
                className={`category-btn${selectedSupplier === supplier.id ? ' active' : ''}`}
                onClick={() => onSupplierChange(supplier.id)}
              >
                {supplier.name}
                <span className="category-count l1">({supplier.products})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="filter-section">
          <h3 className="filter-title p1-medium">Rango de precio</h3>
          <div className="price-range-group">
            <input
              type="number"
              min={minPrice}
              max={maxPrice}
              value={priceRange[0] === 0 ? '' : priceRange[0]}
              onChange={e => {
                let val = e.target.value
                if (val === '') {
                  onPriceRangeChange([0, priceRange[1]])
                  return
                }

                if (/^0\d+/.test(val)) val = val.replace(/^0+/, '')

                let num = Number(val)
                if (isNaN(num)) num = minPrice
                if (num > maxPrice) num = maxPrice
                onPriceRangeChange([num, priceRange[1]])
              }}
              className="price-input"
              placeholder="Mín"
            />
            <span className="price-range-sep">-</span>
            <input
              type="number"
              min={minPrice}
              max={maxPrice}
              value={priceRange[1] === 0 ? '' : priceRange[1]}
              onChange={e => {
                let val = e.target.value
                if (val === '') {
                  onPriceRangeChange([priceRange[0], 0])
                  return
                }

                if (/^0\d+/.test(val)) val = val.replace(/^0+/, '')

                let num = Number(val)
                if (isNaN(num)) num = maxPrice
                if (num > maxPrice) num = maxPrice
                onPriceRangeChange([priceRange[0], num])
              }}
              className="price-input"
              placeholder="Máx"
            />
          </div>
        </div>

        {/* Sort Options */}
        <div className="filter-section">
          <h3 className="filter-title p1-medium">Ordenar por</h3>
          <select 
            value={sortBy} 
            onChange={(e) => onSortChange(e.target.value)}
            className="sort-select p1"
          >
            <option value="name">Nombre A-Z</option>
            <option value="price">Precio</option>
            <option value="stock">Stock disponible</option>
          </select>
        </div>


        {/* Clear Filters */}
        <div className="filter-section">
          <button className="btn btn-secondary cta1" onClick={onClearFilters}>
            <span className="material-icons">clear_all</span>
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductFilters