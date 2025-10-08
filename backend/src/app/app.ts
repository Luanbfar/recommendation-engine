import PostgresDataSource from "../database/postgres.ts";
import { ProductModel } from "../models/product-model.ts";
import { UserModel } from "../models/user-model.ts";
import { PostgresProductRepository } from "../repositories/product-repository.ts";
import { PostgresUserRepository } from "../repositories/user-repository.ts";
import { ProductService } from "../services/product-service.ts";
import { UserService } from "../services/user-service.ts";

console.log("App is running...");

try {
  await PostgresDataSource.initialize();
  if (PostgresDataSource.isInitialized) {
    console.log("Data Source has been initialized!");
  }
} catch (error) {
  console.error("Error during Data Source initialization:", error);
}

// Dependency Injection

const userRepository = new PostgresUserRepository(UserModel, PostgresDataSource.manager);
const productRepository = new PostgresProductRepository(ProductModel, PostgresDataSource.manager);
const userService = new UserService(userRepository);
const productService = new ProductService(productRepository);

export { userService, productService };
