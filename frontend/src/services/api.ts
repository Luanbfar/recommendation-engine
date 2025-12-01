import { GraphQLClient } from 'graphql-request'
import type { Product, User, UserProduct } from '../types/types'

const API_URL = 'http://localhost:4000/graphql'   //fds hardcode msm
const client = new GraphQLClient(API_URL)

export const api = {
  createUser: async (userData: { name: string; email: string }): Promise<User> => {
    const query = `
      mutation CreateUser($userData: UserInput!) {
        createUser(userData: $userData) {
          id
          name
          email
          taste
        }
      }
    `;
    const result = await client.request(query, { userData });
    return result.createUser;
  },

 updateUserTaste: async (email: string, userProducts: UserProduct[]): Promise<User> => {
  const query = `
    mutation UpdateUserTaste($email: String!, $userProducts: [UserProduct!]!) {
      updateUserTaste(email: $email, userProducts: $userProducts) {
        id
        name
        email       # <-- adicione aqui
        taste
      }
    }
  `;
  const result = await client.request(query, { email, userProducts });
  return result.updateUserTaste;
},


  getAllProducts: async (limit: number = 50): Promise<Product[]> => {
    const query = `
      query GetAllProducts($limit: Int) {
        getAllProducts(limit: $limit) {
          id
          name
          description
          price
          category
        }
      }
    `;
    const result = await client.request(query, { limit });
    return result.getAllProducts;
  },

  createProduct: async (productData: any): Promise<Product> => {
    const query = `
      mutation CreateProduct($productData: ProductInput!) {
        createProduct(productData: $productData) {
          id
          name
          description
          price
          category
        }
      }
    `;
    const result = await client.request(query, { productData });
    return result.createProduct;
  },

  getUserRecommendations: async (email: string, limit: number = 5): Promise<string[]> => {
    const query = `
      query GetUserRecommendations($email: String!, $limit: Int!) {
        getUserRecommendations(email: $email, limit: $limit)
      }
    `;
    const result = await client.request(query, { email, limit });
    return result.getUserRecommendations;
  }
};
