import type { User } from "../interfaces/user.ts";
import type { ProductService } from "./product-service.ts";
import type { UserService } from "./user-service.ts";

export class RecommendationService {
  private productService: ProductService;
  private userService: UserService;

  constructor(productService: ProductService, userService: UserService) {
    this.productService = productService;
    this.userService = userService;
  }

  async getUserTaste(email: string, userProducts: Map<string, number>): Promise<User | null> {
    const user = await this.userService.getUserByEmail(email);
    if (user) {
      const userId = user.id;
      for (const productId of userProducts.keys()) {
        const amount = userProducts.get(productId);
        const fetchedProduct = await this.productService.getProductById(productId);
        if (!fetchedProduct) continue;
        const productVector = fetchedProduct.vector;
        if (productVector) {
          if (user.taste.length < 1) {
            user.taste = productVector;
          } else {
            for (let i = 0; i < productVector.length; i++) {
              user.taste[i] = (user.taste[i]! * (1 - amount!) + productVector[i]! * amount!) / (1 + amount!);
            }
          }
        }
      }
      await this.userService.updateUserById(userId, { taste: user.taste });
      return user;
    }
    return null;
  }

  async getUserRecommendations(email: string, limit: number): Promise<string[]> {
    const user = await this.userService.getUserByEmail(email);
    if (!user || !user.taste) {
      throw new Error("User not found or has no taste profile");
    }
    const vector = `[${user.taste.join(",")}]`;
    const similarProducts = await this.productService.getSimilarProducts(vector, limit);
    return similarProducts.map((p) => p.id);
  }
}
