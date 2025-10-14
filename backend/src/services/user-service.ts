import type { ProductRepository } from "../interfaces/product.ts";
import type { User, UserRepository } from "../interfaces/user.ts";

export class UserService {
  private userRepo: UserRepository;
  private productRepo: ProductRepository;

  constructor(userRepo: UserRepository, productRepo: ProductRepository) {
    this.userRepo = userRepo;
    this.productRepo = productRepo;
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async createUser(userData: Partial<User>): Promise<User> {
    if (!userData.name) {
      throw new Error("Name is required");
    }
    if (!userData.email || !this.validateEmail(userData.email)) {
      throw new Error("Invalid email format");
    }
    const existingUser = await this.userRepo.findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("Email already in use");
    }
    const user = await this.userRepo.createUser(userData);
    user.taste = user.taste || [];
    return user;
  }

  async getUserTaste(id: number, userProducts: Map<string, number>): Promise<User | null> {
    const user = await this.userRepo.findUserById(id);
    if (user) {
      for (const product of userProducts.keys()) {
        const fetchedProduct = await this.productRepo.findProductById(product);
        const productVector = fetchedProduct?.vector;
        if (productVector) {
          if (!user.taste) {
            user.taste = productVector;
          } else {
            for (let i = 0; i < productVector.length; i++) {
              user.taste[i] =
                (user.taste[i]! * (1 - userProducts.get(product)!) + productVector[i]! * userProducts.get(product)!) /
                (1 + userProducts.get(product)!);
            }
          }
        }
      }
      return user;
    }
    return null;
  }

  async getUserRecommendations(id: number, limit: number): Promise<string[]> {
    const user = await this.userRepo.findUserById(id);
    if (!user || !user.taste) {
      throw new Error("User not found or has no taste profile");
    }
    const similarProducts = await this.productRepo.findSimilarProducts(user.taste, limit);
    return similarProducts.map((p) => p.id);
  }

  async getUserById(id: number): Promise<User | null> {
    const user = await this.userRepo.findUserById(id);
    if (user) {
      user.taste = user.taste || [];
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.validateEmail(email)) {
      throw new Error("Invalid email format");
    }
    const user = await this.userRepo.findUserByEmail(email);
    if (user) {
      user.taste = user.taste || [];
    }
    return user;
  }

  async updateUserById(id: number, updateData: Partial<User>): Promise<User | null> {
    const user = await this.userRepo.findUserById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    if (updateData.email) {
      if (!this.validateEmail(updateData.email)) {
        throw new Error("Invalid email format");
      }

      const existingUser = await this.userRepo.findUserByEmail(updateData.email);

      if (existingUser && existingUser.id !== id) {
        throw new Error("Email already in use");
      }
    }
    const updatedUser = await this.userRepo.updateUserById(id, updateData);
    if (updatedUser) {
      updatedUser.taste = updatedUser.taste || [];
    }
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return await this.userRepo.deleteUser(id);
  }
}
