import { GraphQLError } from "graphql";
import { productService } from "../../app/app.ts";
import type { Product } from "../../interfaces/product.ts";

export const productResolvers = {
  Query: {
    async getProduct(_: any, args: { id: string }) {
      try {
        return await productService.getProductById(args.id);
      } catch (error: any) {
        throw new GraphQLError(error.message || "Failed to fetch product");
      }
    },

    async getAllProducts(_: any, args: { limit?: number }) {
      try {
        const limit = args.limit || 50;
        return await productService.getAllProducts(limit);
      } catch (error: any) {
        throw new GraphQLError(error.message || "Failed to fetch all products");
      }
    },

    async getRecentProducts(_: any, args: { limit?: number }) {
      try {
        const limit = args.limit || 10;
        return await productService.getRecentProducts(limit);
      } catch (error: any) {
        throw new GraphQLError(error.message || "Failed to fetch recent products");
      }
    },

    async getRandomProducts(_: any, args: { limit?: number }) {
      try {
        const limit = args.limit || 10;
        return await productService.getRandomProducts(limit);
      } catch (error: any) {
        throw new GraphQLError(error.message || "Failed to fetch random products");
      }
    },
  },
  
  Mutation: {
    async createProduct(_: any, args: { productData: Partial<Product> }) {
      try {
        return await productService.createProduct(args.productData);
      } catch (error: any) {
        throw new GraphQLError(error.message || "Failed to create product");
      }
    },
    
    async updateProduct(_: any, args: { id: string; productData: Partial<Product> }) {
      try {
        return await productService.updateProduct(args.id, args.productData);
      } catch (error: any) {
        throw new GraphQLError(error.message || "Failed to update product");
      }
    },
    
    async deleteProduct(_: any, args: { id: string }) {
      try {
        return await productService.deleteProduct(args.id);
      } catch (error: any) {
        throw new GraphQLError(error.message || "Failed to delete product");
      }
    },
  },
};