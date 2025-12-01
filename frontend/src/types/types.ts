export interface Product {
  id: string
  name: string
  description?: string
  price: number
  category: string
  vector?: number[]
}

export interface User {
  id: number
  name: string
  email: string
  taste?: number[]
}

export interface UserProduct {
  productId: string
  amount: number
}