import { parentPort } from "worker_threads";
import { ProductModel } from "../models/product-model.ts";
import { PostgresProductRepository, RedisProductStagingRepository } from "../repositories/product-repository.ts";
import { BedrockEmbeddingService } from "../services/embedding-service.ts";
import { ProductEmbeddingWorkerService } from "../services/product-worker-service.ts";
import redisClient from "../database/redis.ts";
import PostgresDataSource from "../database/postgres.ts";
import type { RedisClientType } from "redis";

console.log("[Worker Thread] Initializing...");

async function startWorker() {
  try {
    await redisClient.connect();
    if (redisClient.isOpen) {
      console.log("[Worker Thread] Redis client connected!");
    }
    await PostgresDataSource.initialize();
    if (PostgresDataSource.isInitialized) {
      console.log("[Worker Thread] Postgres Data Source has been initialized!");
    }

    const productRepo = new PostgresProductRepository(ProductModel, PostgresDataSource.manager);
    const stagingRepo = new RedisProductStagingRepository(redisClient as RedisClientType);

    const embeddingService = new BedrockEmbeddingService(5);

    const workerService = new ProductEmbeddingWorkerService(stagingRepo, productRepo, embeddingService, 5, 30000);

    workerService.start();

    console.log("[Worker Thread] Worker started successfully");

    parentPort?.on("message", async (message) => {
      if (message === "stop") {
        console.log("[Worker Thread] Received stop signal");

        if (workerService) {
          workerService.stop();
        }

        try {
          await redisClient.quit();
          console.log("[Worker Thread] Redis disconnected");
        } catch (error) {
          console.error("[Worker Thread] Error closing Redis:", error);
        }

        try {
          await PostgresDataSource.destroy();
          console.log("[Worker Thread] PostgreSQL disconnected");
        } catch (error) {
          console.error("[Worker Thread] Error closing PostgreSQL:", error);
        }

        process.exit(0);
      }
    });
  } catch (error) {
    console.error("[Worker Thread] Failed to start:", error);
    process.exit(1);
  }
}

startWorker();
