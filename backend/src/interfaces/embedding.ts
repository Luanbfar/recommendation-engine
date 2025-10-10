import type { ProductStaging } from "./product.ts";

export interface EmbeddingResult {
  productId: string;
  embedding: number[];
}

export interface EmbeddingService {
  createProductText(product: ProductStaging): string;
  generateEmbeddings(products: ProductStaging[]): Promise<EmbeddingResult[]>;
}
