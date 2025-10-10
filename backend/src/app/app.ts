import type { RedisClientType } from "redis";
import PostgresDataSource from "../database/postgres.ts";
import redisClient from "../database/redis.ts";
import { ProductModel } from "../models/product-model.ts";
import { UserModel } from "../models/user-model.ts";
import { PostgresProductRepository, RedisProductStagingRepository } from "../repositories/product-repository.ts";
import { PostgresUserRepository } from "../repositories/user-repository.ts";
import { ProductService } from "../services/product-service.ts";
import { UserService } from "../services/user-service.ts";
import { ProductEmbeddingWorker } from "../services/worker.ts";
import { BedrockEmbeddingService } from "../services/embedding-service.ts";

console.log("App is running...");

try {
  await redisClient.connect();
  if (redisClient.isOpen) {
    console.log("Redis client connected!");
  }
  await PostgresDataSource.initialize();
  if (PostgresDataSource.isInitialized) {
    console.log("Postgres Data Source has been initialized!");
  }
} catch (error) {
  console.error("Error during database initialization:", error);
}

// Dependency Injection

// User
const userRepository = new PostgresUserRepository(UserModel, PostgresDataSource.manager);
const userService = new UserService(userRepository);

// Product
const productRepository = new PostgresProductRepository(ProductModel, PostgresDataSource.manager);
const productStagingRepository = new RedisProductStagingRepository(redisClient as RedisClientType);
const productService = new ProductService(productRepository, productStagingRepository);
const embeddingService = new BedrockEmbeddingService(5);

// Worker
const worker = new ProductEmbeddingWorker(productStagingRepository, productRepository, embeddingService, 5, 30000);

worker.start();

// Graceful shutdown
const shutdown = async () => {
  console.log("\nShutting down worker...");
  worker.stop();

  try {
    await redisClient.quit();
    console.log("Redis connection closed");
  } catch (error) {
    console.error("Error closing Redis:", error);
  }

  try {
    await PostgresDataSource.destroy();
    console.log("PostgreSQL connection closed");
  } catch (error) {
    console.error("Error closing PostgreSQL:", error);
  }

  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export { userService, productService };
