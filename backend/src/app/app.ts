import type { RedisClientType } from "redis";
import PostgresDataSource from "../database/postgres.ts";
import redisClient from "../database/redis.ts";
import { ProductModel } from "../models/product-model.ts";
import { UserModel } from "../models/user-model.ts";
import {
  PostgresProductRepository,
  RedisProductStagingRepository,
} from "../repositories/product-repository.ts";
import { PostgresUserRepository } from "../repositories/user-repository.ts";
import { ProductService } from "../services/product-service.ts";
import { UserService } from "../services/user-service.ts";
import { WorkerManager } from "../services/worker-manager.ts";
import { RecommendationService } from "../services/recomendation-service.ts";

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

// Product
const productRepository = new PostgresProductRepository(
  ProductModel,
  PostgresDataSource.manager
);
const productStagingRepository = new RedisProductStagingRepository(
  redisClient as RedisClientType
);
const productService = new ProductService(
  productRepository,
  productStagingRepository
);

// User
const userRepository = new PostgresUserRepository(
  UserModel,
  PostgresDataSource.manager
);
const userService = new UserService(userRepository);

// Recommendation
const recommendationService = new RecommendationService(
  productService,
  userService
);

const workerManager = new WorkerManager();
workerManager.start("productWorker", "product-worker-thread");

export { userService, productService, recommendationService };

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`Received ${signal}, starting graceful shutdown...`);

  const shutdownPromises = [
    workerManager
      .stopAll()
      .catch((e) => console.error("Error stopping workers:", e)),
    redisClient.quit().catch((e) => console.error("Error closing Redis:", e)),
    PostgresDataSource.destroy().catch((e) =>
      console.error("Error closing PostgreSQL:", e)
    ),
  ];
//timeoutzinho p nao trava shutdown
  const timeout = setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 30000);

  try {
    await Promise.allSettled(shutdownPromises);
    clearTimeout(timeout);
    console.log("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

export const healthCheck = async () => {
  const checks = {
    redis: redisClient.isOpen,
    postgres: PostgresDataSource.isInitialized,
    redisPing: await redisClient.ping().catch(() => false),
    postgresQuery: await PostgresDataSource.query('SELECT 1').then(() => true).catch(() => false)
  };

  const isHealthy = Object.values(checks).every(Boolean);
  return { isHealthy, checks };
};


process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
