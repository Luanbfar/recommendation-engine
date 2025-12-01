import React, { useState, useEffect } from 'react'
import { api } from './services/api'
import type { Product, User, UserProduct } from './types/types'
import { ProductList } from './components/ProductList'
import { UserProfile } from './components/UserProfile'
import { Recommendations } from './components/Recommendations'
import { CreateProduct } from './components/CreateProduct'
import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const productsData = await api.getAllProducts(20)
      setProducts(productsData)
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const handleCreateUser = async (name: string, email: string) => {
    if (!name || !email) {
      console.warn('Name and email are required to create user')
      return
    }
    try {
      const newUser = await api.createUser({ name, email })
      setUser(newUser)
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  const handleUpdateTaste = async (userProducts: UserProduct[]) => {
    if (!user?.email) {
      console.warn('Cannot update taste: user email not set')
      return
    }
    if (userProducts.length === 0) {
      console.warn('No products selected for update')
      return
    }

    try {
      const updatedUser = await api.updateUserTaste(user.email, userProducts)
      setUser(updatedUser)
    } catch (error) {
      console.error('Error updating taste:', error)
    }
  }

  const handleGetRecommendations = async () => {
    if (!user?.email) {
      console.warn('Cannot get recommendations: user email not set')
      return
    }

    setLoading(true)
    try {
      const recs = await api.getUserRecommendations(user.email, 5)
      setRecommendations(recs)
    } catch (error) {
      console.error('Error getting recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async (productData: any) => {
    try {
      await api.createProduct(productData)
      await loadProducts()
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎯 AI Recommendation Engine</h1>
        <p>Powered by AWS Bedrock & Machine Learning</p>
      </header>

      <div className="app-container">
        <div className="sidebar">
          <UserProfile 
            user={user}
            onCreateUser={handleCreateUser}
            onUpdateTaste={handleUpdateTaste}
            products={products}
          />
          
          <CreateProduct onCreateProduct={handleCreateProduct} />
        </div>

        <div className="main-content">
          <div className="recommendations-section">
            <button 
              onClick={handleGetRecommendations}
              disabled={!user?.email || loading}
              className="recommendation-btn"
            >
              {loading ? '🔄 Getting Recommendations...' : '🎁 Get Recommendations'}
            </button>
            
            <Recommendations 
              recommendations={recommendations}
              products={products}
              loading={loading}
            />
          </div>

          <ProductList products={products} />
        </div>
      </div>
    </div>
  )
}

export default App
