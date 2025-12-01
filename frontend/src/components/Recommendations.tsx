import React from 'react'
import type { Product } from '../types/types'

interface RecommendationsProps {
  recommendations: string[]
  products: Product[]
  loading: boolean
}

export const Recommendations: React.FC<RecommendationsProps> = ({ 
  recommendations, 
  products, 
  loading 
}) => {
  const recommendedProducts = products.filter(p => 
    recommendations.includes(p.id)
  )

  return (
    <div className="recommendations">
      <h2>🎁 Recommended For You</h2>
      
      {loading ? (
        <div className="loading">🔄 Loading recommendations...</div>
      ) : recommendations.length === 0 ? (
        <div className="empty-state">
          <p>No recommendations yet. Update your taste profile and click "Get Recommendations"!</p>
        </div>
      ) : (
        <div className="recommendations-grid">
          {recommendedProducts.map((product, index) => (
            <div key={product.id} className="recommendation-card">
              <div className="recommendation-rank">#{index + 1}</div>
              <div className="recommendation-content">
                <h3>{product.name}</h3>
                <p className="recommendation-description">{product.description}</p>
                <div className="recommendation-details">
                  <span className="price">${product.price}</span>
                  <span className="category">{product.category}</span>
                </div>
                <div className="recommendation-id">ID: {product.id.substring(0, 8)}...</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}