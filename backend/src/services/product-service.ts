import type { Product, ProductRepository } from "../interfaces/product.ts";

export class ProductService {
  private productRepository: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  async getProductById(id: string): Promise<Product | null> {
    const product = await this.productRepository.findProductById(id);
    if (product) {
      product.vector = product.vector || [];
    }
    return product;
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    return await this.productRepository.createProduct(productData);
  }

  async updateProduct(id: string, updateData: Partial<Product>): Promise<Product | null> {
    const product = await this.productRepository.updateProduct(id, updateData);
    if (product) {
      product.vector = product.vector || [];
    }
    return product;
  }
  async deleteProduct(id: string): Promise<boolean> {
    return await this.productRepository.deleteProduct(id);
  }
}
