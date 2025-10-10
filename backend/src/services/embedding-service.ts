import { bedrockAccessKey, bedrockModelId, bedrockRegion, bedrockSecretKey } from "../config/env.ts";
import type { EmbeddingResult, EmbeddingService } from "../interfaces/embedding.ts";
import { BedrockEmbeddings } from "@langchain/aws";
import type { ProductStaging } from "../interfaces/product.ts";

export class BedrockEmbeddingService implements EmbeddingService {
  private embeddings: BedrockEmbeddings;
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 5) {
    this.embeddings = new BedrockEmbeddings({
      model: bedrockModelId,
      region: bedrockRegion,
      maxConcurrency: maxConcurrent,
      maxRetries: 3,
      credentials: {
        accessKeyId: bedrockAccessKey,
        secretAccessKey: bedrockSecretKey,
      },
    });
    this.maxConcurrent = maxConcurrent;
  }

  createProductText(product: ProductStaging): string {
    return `${product.name}. ${product.description || ""}. Category: ${product.category}. Price: ${product.price}`;
  }

  async generateEmbeddings(products: ProductStaging[]): Promise<EmbeddingResult[]> {
    if (products.length === 0) return [];

    const texts = products.map((product) => this.createProductText(product));
    const productIds = products.map((p) => p.id);

    const results: EmbeddingResult[] = [];

    for (let i = 0; i < texts.length; i += this.maxConcurrent) {
      const batch = texts.slice(i, i + this.maxConcurrent);
      const batchIds = productIds.slice(i, i + this.maxConcurrent);
      try {
        const embeddings = await this.embeddings.embedDocuments(batch);

        for (let j = 0; j < embeddings.length; j++) {
          results.push({
            productId: batchIds[j]!,
            embedding: embeddings[j]!,
          });
        }

        if (i + this.maxConcurrent < texts.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error embedding batch starting at index ${i}`, error);
      }
    }
    return results;
  }
}
