import type { EmbeddingService } from "../interfaces/embedding.ts";
import type { ProductStagingRepository } from "../interfaces/product.ts";
import type { ProductRepository } from "../interfaces/product.ts";

export class ProductEmbeddingWorkerService {
  private stagingRepo: ProductStagingRepository;
  private productRepo: ProductRepository;
  private embeddingService: EmbeddingService;
  private batchSize: number;
  private intervalMs: number;
  private intervalId?: NodeJS.Timeout | undefined;
  private isProcessing: boolean = false;

  constructor(
    stagingRepo: ProductStagingRepository,
    productRepo: ProductRepository,
    embeddingService: EmbeddingService,
    batchSize: number,
    intervalMs: number
  ) {
    this.stagingRepo = stagingRepo;
    this.productRepo = productRepo;
    this.embeddingService = embeddingService;
    this.batchSize = batchSize;
    this.intervalMs = intervalMs;
  }

  async processBatch(): Promise<void> {
    if (this.isProcessing) {
      console.log("Previous batch still processing, skipping...");
      return;
    }

    this.isProcessing = true;

    try {
      const stagedProducts = await this.stagingRepo.findUnprocessedProducts(this.batchSize);

      if (stagedProducts.length === 0) {
        console.log("No products to process");
        return;
      }

      console.log(`Processing ${stagedProducts.length} products...`);

      const productIds = stagedProducts.map((p) => p.id);
      await this.stagingRepo.toggleProcessing(productIds, true);

      const embeddingResults = await this.embeddingService.generateEmbeddings(stagedProducts);

      if (embeddingResults.length === 0) {
        console.log("No embeddings generated, skipping insertion");
        this.stagingRepo.toggleProcessing(productIds, false);
        return;
      }

      const embeddingMap = new Map(embeddingResults.map((r) => [r.productId, r.embedding]));

      const insertedProducts: string[] = [];
      for (const staged of stagedProducts) {
        const embedding = embeddingMap.get(staged.id);
        if (!embedding) {
          console.error(`No embedding found for product ${staged.id}`);
          continue;
        }

        try {
          const product = await this.productRepo.createProduct({
            id: staged.id,
            name: staged.name,
            description: staged.description || "",
            price: staged.price,
            category: staged.category,
            vector: embedding,
          });
          insertedProducts.push(staged.id);
          console.log(`Successfully processed product: ${product.id} (${product.name})`);
        } catch (error) {
          console.error(`Failed to insert product ${staged.id}:`, error);
        }
      }

      if (insertedProducts.length > 0) {
        await this.stagingRepo.deleteProducts(insertedProducts);
        console.log(`Removed ${insertedProducts.length} products from Redis`);
      }
      this.stagingRepo.toggleProcessing(productIds, false);
      return;
    } catch (error) {
      console.error("Error processing batch:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  start(): void {
    console.log(`Starting worker service with ${this.intervalMs}ms interval...`);
    this.intervalId = setInterval(() => this.processBatch(), this.intervalMs);

    this.processBatch();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log("Worker service stopped");
    }
  }
}
