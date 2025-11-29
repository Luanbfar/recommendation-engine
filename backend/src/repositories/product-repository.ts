import { In, Repository } from "typeorm";
import type { Product, ProductRepository, ProductStaging, ProductStagingRepository } from "../interfaces/product.ts";
import type { RedisClientType } from "redis";

export class PostgresProductRepository extends Repository<Product> implements ProductRepository {
  async findProductById(id: string): Promise<Product | null> {
    return await this.findOneBy({ id });
  }
  
  async findProductByName(name: string): Promise<Product | null> {
    return await this.findOneBy({ name });
  }
  
  async createProduct(productData: Partial<Product>): Promise<Product> {
    const product = this.create(productData);
    return await this.save(product);
  }
  
  async findSimilarProducts(vector: string, limit: number): Promise<Product[]> {
    return await this.query(
      `
      SELECT id, name, vector <-> $1 AS distance
      FROM products
      ORDER BY distance ASC
      LIMIT $2
      `,
      [vector, limit]
    );
  }
  
  async updateProduct(id: string, updateData: Partial<Product>): Promise<Product | null> {
    const result = await this.update(id, updateData);
    if (result.affected && result.affected > 0) {
      return await this.findOneBy({ id });
    }
    return null;
  }
  
  async deleteProduct(id: string): Promise<boolean> {
    const result = await this.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async findAllProducts(limit: number = 50): Promise<Product[]> {
    return await this.find({
      take: limit,
      order: { name: 'ASC' }
    });
  }

  async findRecentProducts(limit: number = 10): Promise<Product[]> {
    return await this.find({
      take: limit,
      order: { id: 'DESC' }
    });
  }

  async findRandomProducts(limit: number = 10): Promise<Product[]> {
    return await this.query(
      `SELECT * FROM products ORDER BY RANDOM() LIMIT $1`,
      [limit]
    );
  }
}

export class RedisProductStagingRepository implements ProductStagingRepository {
  private client: RedisClientType;
  private readonly KEY_PREFIX = "staging:product:";
  private readonly QUEUE_KEY = "staging:queue";

  constructor(client: RedisClientType) {
    this.client = client;
  }

  async createProductStaging(productData: ProductStaging): Promise<ProductStaging> {
    const key = `${this.KEY_PREFIX}${productData.id}`;

    await this.client.set(key, JSON.stringify(productData));

    await this.client.zAdd(this.QUEUE_KEY, {
      score: productData.createdAt.getTime(),
      value: productData.id,
    });

    return productData;
  }

  async findUnprocessedProducts(limit: number): Promise<ProductStaging[]> {
    const ids = await this.client.zRange(this.QUEUE_KEY, 0, limit - 1);

    if (ids.length === 0) {
      return [];
    }

    const products: ProductStaging[] = [];
    for (const id of ids) {
      const key = `${this.KEY_PREFIX}${id}`;
      const data = await this.client.get(key);

      if (data) {
        const product: ProductStaging = JSON.parse(data);
        product.createdAt = new Date(product.createdAt);

        if (!product.isProcessing) {
          products.push(product);
        }
      }
    }

    return products.slice(0, limit);
  }

  async toggleProcessing(ids: string[], isProcessing: boolean): Promise<void> {
    for (const id of ids) {
      const key = `${this.KEY_PREFIX}${id}`;
      const data = await this.client.get(key);

      if (data) {
        const product: ProductStaging = JSON.parse(data);
        product.isProcessing = isProcessing;
        await this.client.set(key, JSON.stringify(product));
      }
    }
  }

  async deleteProducts(ids: string[]): Promise<void> {
    const keys = ids.map((id) => `${this.KEY_PREFIX}${id}`);

    if (keys.length > 0) {
      await this.client.del(keys);
    }

    if (ids.length > 0) {
      await this.client.zRem(this.QUEUE_KEY, ids);
    }
  }
}