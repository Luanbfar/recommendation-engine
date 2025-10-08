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
