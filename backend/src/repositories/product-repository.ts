import { Repository } from "typeorm";
import type { Product, ProductRepository } from "../interfaces/product.ts";

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
  async findSimilarProducts(vector: number[], limit: number): Promise<Product[]> {
    return await this.query(
      `
      SELECT id, name, vector <-> $1 AS distance
      FROM product
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
}
