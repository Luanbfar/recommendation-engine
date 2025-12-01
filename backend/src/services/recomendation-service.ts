// services/recommendation-service.ts - VERSÃO CORRIGIDA
import type { User } from "../interfaces/user.ts";
import type { ProductService } from "./product-service.ts";
import type { UserService } from "./user-service.ts";

export class RecommendationService {
  private productService: ProductService;
  private userService: UserService;
  private userProductHistory = new Map<string, string[]>(); 

  constructor(productService: ProductService, userService: UserService) {
    this.productService = productService;
    this.userService = userService;
  }

  async calculateUserTaste(userProducts: Map<string, number>): Promise<number[]> {
    if (!userProducts || userProducts.size === 0) return [];

    let totalWeight = 0;
    const weightedVectors: number[][] = [];

    for (const [productId, amount] of userProducts) {
      const product = await this.productService.getProductById(productId);

      if (!product || !product.vector || product.vector.length === 0) {
        continue;
      }

      const weight = Math.log(1 + amount);
      const weightedVector = product.vector.map(v => v * weight);

      weightedVectors.push(weightedVector);
      totalWeight += weight;
    }

    if (weightedVectors.length === 0) return [];

    const vectorLength = weightedVectors[0]?.length ?? 0;
    if (vectorLength === 0) return [];

    const averageVector = new Array(vectorLength).fill(0);

    for (const vector of weightedVectors) {
      for (let i = 0; i < vectorLength; i++) {
        averageVector[i] += vector[i];
      }
    }

    if (totalWeight > 0) {
      for (let i = 0; i < vectorLength; i++) {
        averageVector[i] /= totalWeight;
      }
    }

    return averageVector;
  }

  async getUserTaste(email: string, userProducts: Map<string, number>): Promise<User | null> {
    const user = await this.userService.getUserByEmail(email);
    if (!user) throw new Error("User not found");

    const productIds = Array.from(userProducts.keys());
    this.userProductHistory.set(email, productIds);

    const tasteVector = await this.calculateUserTaste(userProducts);

    if (tasteVector.length > 0) {
      user.taste = tasteVector;
      await this.userService.updateUserById(user.id, { taste: user.taste });
    }

    return user;
  }

  async getUserRecommendations(email: string, limit: number = 10): Promise<string[]> {
    const user = await this.userService.getUserByEmail(email);

    if (!user?.taste || user.taste.length === 0) {
      return await this.getFallbackRecommendations(limit);
    }

    const vector = `[${user.taste.join(",")}]`;
    
    const similarProducts = await this.productService.getSimilarProducts(vector, limit * 2);

    if (!similarProducts || similarProducts.length === 0) {
      return await this.getFallbackRecommendations(limit);
    }

    const userProductIds = await this.getUserProductIds(email);

    const filteredProducts = similarProducts.filter(
      p => p && p.id && !userProductIds.includes(p.id)
    );

    if (filteredProducts.length < limit) {
      const remaining = limit - filteredProducts.length;
      const fallback = await this.getFallbackRecommendations(remaining);
      return [
        ...filteredProducts.slice(0, limit).map(p => p.id),
        ...fallback
      ].slice(0, limit);
    }

    return filteredProducts.slice(0, limit).map(p => p.id);
  }

  private async getFallbackRecommendations(limit: number): Promise<string[]> {
    const neutralVector = new Array(1024).fill(0.1).join(",");
    const products = await this.productService.getSimilarProducts(`[${neutralVector}]`, limit);

    if (!products) return [];
    return products.map(p => p.id);
  }

  private async getUserProductIds(email: string): Promise<string[]> {
    return this.userProductHistory.get(email) || [];
  }

  async getSimilarProducts(productId: string, limit: number = 5): Promise<string[]> {
    const product = await this.productService.getProductById(productId);

    if (!product?.vector || product.vector.length === 0) {
      return [];
    }

    const vector = `[${product.vector.join(",")}]`;

    const similarProducts = await this.productService.getSimilarProducts(vector, limit + 1);

    if (!similarProducts) return [];

    return similarProducts
      .filter(p => p && p.id !== productId)
      .slice(0, limit)
      .map(p => p.id);
  }
}