import React, { useState } from 'react'
import type { User, Product, UserProduct } from '../types/types'

interface UserProfileProps {
  user: User | null
  products: Product[]
  onCreateUser: (name: string, email: string) => void
  onUpdateTaste: (userProducts: UserProduct[]) => void
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  products, 
  onCreateUser, 
  onUpdateTaste 
}) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(new Map())

  const handleCreateUser = () => {
    if (!name || !email) {
      console.warn('Name and email are required to create user')
      return
    }
    onCreateUser(name, email)
    setName('')
    setEmail('')
  }

  const handleProductSelect = (productId: string, amount: number) => {
    const newSelection = new Map(selectedProducts)
    if (amount > 0) {
      newSelection.set(productId, amount)
    } else {
      newSelection.delete(productId)
    }
    setSelectedProducts(newSelection)
  }

  const handleUpdateTaste = () => {
    if (!user?.email) {
      console.warn('Cannot update taste: user email not set')
      return
    }
    if (selectedProducts.size === 0) {
      console.warn('No products selected')
      return
    }

    const userProducts: UserProduct[] = Array.from(selectedProducts.entries()).map(
      ([productId, amount]) => ({ productId, amount })
    )
    onUpdateTaste(userProducts)
    setSelectedProducts(new Map())
  }

  return (
    <div className="user-profile">
      <h2>👤 User Profile</h2>
      
      {user ? (
        <div className="user-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Taste Vector:</strong> {user.taste ? `${user.taste.length} dimensions` : 'Not set'}</p>
        </div>
      ) : (
        <div className="create-user">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <button onClick={handleCreateUser} className="btn">
            Create User
          </button>
        </div>
      )}

      {user && (
        <div className="taste-selector">
          <h3>🎯 Select Your Preferences</h3>
          <div className="product-selection">
            {products.slice(0, 5).map((product) => (
              <div key={product.id} className="product-selection-item">
                <span>{product.name}</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  defaultValue={selectedProducts.get(product.id) || 0}
                  onChange={(e) => handleProductSelect(product.id, parseInt(e.target.value) || 0)}
                  className="amount-input"
                />
              </div>
            ))}
          </div>
          <button 
            onClick={handleUpdateTaste} 
            disabled={selectedProducts.size === 0 || !user?.email}
            className="btn"
          >
            Update Taste Profile
          </button>
        </div>
      )}
    </div>
  )
}
