import React from 'react'
import type { Product } from '../types/types'

interface ProductListProps {
  products: Product[]
}

export const ProductList: React.FC<ProductListProps> = ({ products }) => {
  return (
    <div className="product-list">
      <h2>📦 Products Catalog ({products.length})</h2>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-header">
              <h3>{product.name}</h3>
              <span className="product-price">${product.price}</span>
            </div>
            <p className="product-description">{product.description || 'No description'}</p>
            <div className="product-footer">
              <span className="product-category">{product.category}</span>
              <span className="product-id">ID: {product.id.substring(0, 8)}...</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}