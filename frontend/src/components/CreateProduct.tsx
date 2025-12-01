import React, { useState } from 'react'

interface CreateProductProps {
  onCreateProduct: (productData: any) => void
}

export const CreateProduct: React.FC<CreateProductProps> = ({ onCreateProduct }) => {
  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    category: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const productData = {
      id: form.id || `product-${Date.now()}`,
      name: form.name,
      description: form.description,
      price: parseInt(form.price) || 0,
      category: form.category
    }

    onCreateProduct(productData)
    
    setForm({
      id: '',
      name: '',
      description: '',
      price: '',
      category: ''
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="create-product">
      <h2>➕ Create New Product</h2>
      <form onSubmit={handleSubmit} className="product-form">
        <input
          type="text"
          name="id"
          placeholder="Product ID (UUID or leave empty)"
          value={form.id}
          onChange={handleChange}
          className="input"
        />
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          required
          className="input"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="textarea"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
          className="input"
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
          className="input"
        />
        <button type="submit" className="btn">
          Create Product
        </button>
      </form>
    </div>
  )
}